import * as THREE from "three/webgpu";
import { indexOrThrow, bufferIndexOrThrow } from "../../utils.js";
import { Uniforms } from "./index.js";

const NUM_ARROW_SEGMENTS = 1;

export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
  // NOTE: The vertexOffset attribute is used to expand the segments
  // between consecutive points into quads in the vertex shader. The
  // other attributes are duplicated across each vertex in a segment
  // to be used in the fragment shader.
  position = new Float32Array();
  endPosition = new Float32Array();
  prevPosition = new Float32Array();
  nextPosition = new Float32Array();
  positionOffset = new Float32Array();
  vertexOffset = new Float32Array();
  indices = new Uint16Array();

  constructor(
    points: THREE.Vector3[],
    public isArrow: boolean,
  ) {
    super();
    // This segment has data but isn't rendered
    const lastPoint = indexOrThrow(points, points.length - 1);
    const newPoint = lastPoint
      .clone()
      .setX(lastPoint.x - 1)
      .setY(lastPoint.y + 1);
    points.push(newPoint);
    this.setPoints(points);
  }

  getPoint(index: number, output: THREE.Vector3) {
    let buffer, segmentIndex;
    if (index === this.numPoints - 1) {
      buffer = this.endPosition;
      segmentIndex = index - 1;
    } else {
      buffer = this.position;
      segmentIndex = index;
    }

    const bufferOffset = 12 * segmentIndex;
    const x = bufferIndexOrThrow(buffer, bufferOffset);
    const y = bufferIndexOrThrow(buffer, bufferOffset + 1);
    const z = bufferIndexOrThrow(buffer, bufferOffset + 2);
    output.set(x, y, z);
  }

  getLength(index: number) {
    // Exclude segments for the arrow
    const lastSegmentIndex = this.positionOffset.length / 16 - 2;
    if (index === lastSegmentIndex + 1) {
      return bufferIndexOrThrow(this.positionOffset, 16 * lastSegmentIndex + 1);
    } else {
      const bufferOffset = 16 * index;
      return bufferIndexOrThrow(this.positionOffset, bufferOffset);
    }
  }

  get numPoints() {
    // Exclude segments for the arrow
    return this.positionOffset.length / 16 + 1 - 1;
  }

  get length() {
    // Exclude segments for the arrow
    const lastSegmentIndex = this.positionOffset.length / 16 - 2;
    // Return the endLength of the last segment
    return bufferIndexOrThrow(this.positionOffset, 16 * lastSegmentIndex + 1);
  }

  fillArrowSegmentData(proportion: number, output: Uniforms) {
    const totalLength = this.length;
    // PERF: This could be done with binary search.
    for (let i = 0; i < this.numPoints - 1; i++) {
      const startProportion = this.getLength(i) / totalLength;
      const endProportion = this.getLength(i + 1) / totalLength;
      if (startProportion <= proportion && proportion <= endProportion) {
        this.getPoint(i, output.arrowSegmentStart.value);
        this.getPoint(i + 1, output.arrowSegmentEnd.value);
        output.arrowSegmentProportion.value = THREE.MathUtils.inverseLerp(
          startProportion,
          endProportion,
          proportion,
        );
        return;
      }
    }
    throw new Error(`Invalid arrow proportion ${proportion}`);
  }

  setPoints(points: Array<THREE.Vector3>, updateBounds = true) {
    const sizeChanged = this.numPoints !== points.length;
    if (sizeChanged) {
      const sentinel = points.pop();
      this.allocateNewBuffers(points.length - 1 + NUM_ARROW_SEGMENTS);
      points.push(sentinel);
    } else {
      this.setVariableDataNeedsUpdate();
    }
    this.fillBuffers(points);
    if (updateBounds) {
      this.computeBoundingSphere();
      this.computeBoundingBox();
    }
  }

  allocateNewBuffers(numberOfSegments: number) {
    this.dispose();

    this.position = new Float32Array(12 * numberOfSegments);
    this.endPosition = new Float32Array(12 * numberOfSegments);
    this.prevPosition = new Float32Array(12 * numberOfSegments);
    this.nextPosition = new Float32Array(12 * numberOfSegments);
    this.positionOffset = new Float32Array(16 * numberOfSegments);
    this.vertexOffset = new Float32Array(8 * numberOfSegments);
    this.indices = new Uint16Array(6 * numberOfSegments);

    const positionBuffer = new THREE.BufferAttribute(this.position, 3);
    const endPositionBuffer = new THREE.BufferAttribute(this.endPosition, 3);
    const prevPositionBuffer = new THREE.BufferAttribute(this.prevPosition, 3);
    const nextPositionBuffer = new THREE.BufferAttribute(this.nextPosition, 3);
    const positionOffsetBuffer = new THREE.BufferAttribute(
      this.positionOffset,
      4,
    );
    const vertexOffsetBuffer = new THREE.BufferAttribute(this.vertexOffset, 2);
    const indexBuffer = new THREE.BufferAttribute(this.indices, 1);

    this.setAttribute("position", positionBuffer);
    this.setAttribute("endPosition", endPositionBuffer);
    this.setAttribute("prevPosition", prevPositionBuffer);
    this.setAttribute("nextPosition", nextPositionBuffer);
    this.setAttribute("positionOffset", positionOffsetBuffer);
    this.setAttribute("vertexOffset", vertexOffsetBuffer);
    this.setIndex(indexBuffer);

    this.setVariableDataNeedsUpdate();
    this.setStaticDataNeedsUpdate();
  }

  setVariableDataNeedsUpdate() {
    this.getAttribute("position").needsUpdate = true;
    this.getAttribute("endPosition").needsUpdate = true;
    this.getAttribute("prevPosition").needsUpdate = true;
    this.getAttribute("nextPosition").needsUpdate = true;
    this.getAttribute("positionOffset").needsUpdate = true;
  }

  setStaticDataNeedsUpdate() {
    this.getAttribute("vertexOffset").needsUpdate = true;
    if (this.index !== null) {
      this.index.needsUpdate = true;
    }
  }

  fillBuffers(points: THREE.Vector3[]) {
    const sentinel = points.pop();
    this.fillPoints(points);
    this.fillVertexOffsets(points.length - 1, NUM_ARROW_SEGMENTS);
    this.fillOffsets(points);
    this.fillIndices(points.length - 1 + NUM_ARROW_SEGMENTS);
    points.push(sentinel);
  }

  fillPoints(points: THREE.Vector3[]) {
    const numStrokeSegments = points.length - 1;
    for (let i = 0; i < numStrokeSegments; i++) {
      const startPoint = indexOrThrow(points, i);
      const endPoint = indexOrThrow(points, i + 1);
      const prevPoint = indexOrThrow(points, Math.max(i - 1, 0));
      const nextPoint = indexOrThrow(
        points,
        Math.min(i + 2, points.length - 1),
      );
      this.writeVector3ToSegment(this.position, i, startPoint);
      this.writeVector3ToSegment(this.endPosition, i, endPoint);
      this.writeVector3ToSegment(this.prevPosition, i, prevPoint);
      this.writeVector3ToSegment(this.nextPosition, i, nextPoint);
    }

    // NOTE: Arrow segments are skipped since they don't use this
    // data.
  }

  writeVector3ToSegment(
    array: WritableArrayLike<number>,
    segmentIndex: number,
    v: THREE.Vector3Like,
  ) {
    const { x, y, z } = v;
    const arrayOffset = 12 * segmentIndex;
    array[arrayOffset] = x;
    array[arrayOffset + 1] = y;
    array[arrayOffset + 2] = z;
    array[arrayOffset + 3] = x;
    array[arrayOffset + 4] = y;
    array[arrayOffset + 5] = z;
    array[arrayOffset + 6] = x;
    array[arrayOffset + 7] = y;
    array[arrayOffset + 8] = z;
    array[arrayOffset + 9] = x;
    array[arrayOffset + 10] = y;
    array[arrayOffset + 11] = z;
  }

  writeVector4ToSegment(
    array: WritableArrayLike<number>,
    segmentIndex: number,
    v: THREE.Vector4Like,
  ) {
    const { x, y, z, w } = v;
    const arrayOffset = 16 * segmentIndex;
    array[arrayOffset] = x;
    array[arrayOffset + 1] = y;
    array[arrayOffset + 2] = z;
    array[arrayOffset + 3] = w;
    array[arrayOffset + 4] = x;
    array[arrayOffset + 5] = y;
    array[arrayOffset + 6] = z;
    array[arrayOffset + 7] = w;
    array[arrayOffset + 8] = x;
    array[arrayOffset + 9] = y;
    array[arrayOffset + 10] = z;
    array[arrayOffset + 11] = w;
    array[arrayOffset + 12] = x;
    array[arrayOffset + 13] = y;
    array[arrayOffset + 14] = z;
    array[arrayOffset + 15] = w;
  }

  // NOTE: This diagram shows the ordering of the vertices
  // that define a segment together with the vertexOffsets
  // written to each one.
  // y ^
  //   |1, (-1, 1)        3, (1, 1)
  //   *-----------------*
  //   |\               /|
  //   | *-------------* |
  //   |/               \|
  //   *-----------------*--> x
  //  0, (-1, -1)         2, (1, -1)
  fillVertexOffsets(numStrokeSegments: number, numArrowSegments: number) {
    let i = 0;
    for (i = 0; i < numStrokeSegments; i++) {
      const arrayOffset = 8 * i;
      this.vertexOffset[arrayOffset] = -1;
      this.vertexOffset[arrayOffset + 1] = -1;
      this.vertexOffset[arrayOffset + 2] = -1;
      this.vertexOffset[arrayOffset + 3] = 1;
      this.vertexOffset[arrayOffset + 4] = 1;
      this.vertexOffset[arrayOffset + 5] = -1;
      this.vertexOffset[arrayOffset + 6] = 1;
      this.vertexOffset[arrayOffset + 7] = 1;
    }

    // NOTE: Offsets are scaled by 2 for arrow segments to
    // identify them in the vertex shader.
    for (let j = 0; j < numArrowSegments; j++) {
      const arrayOffset = 8 * (i + j);
      this.vertexOffset[arrayOffset] = -2;
      this.vertexOffset[arrayOffset + 1] = -2;
      this.vertexOffset[arrayOffset + 2] = -2;
      this.vertexOffset[arrayOffset + 3] = 2;
      this.vertexOffset[arrayOffset + 4] = 2;
      this.vertexOffset[arrayOffset + 5] = -2;
      this.vertexOffset[arrayOffset + 6] = 2;
      this.vertexOffset[arrayOffset + 7] = 2;
    }
  }

  // NOTE: The indices are chosen to construct the segment
  // as shown here. The order is important because only the
  // front side of 3D lines is rendered.
  // 1, 3              5
  // *-----------------*
  // |                 |
  // |                 |
  // |                 |
  // *-----------------*
  // 2                 0, 4
  fillIndices(segmentCount: number) {
    for (let i = 0; i < segmentCount; i++) {
      const arrayOffset = 6 * i;
      const nextIndex = 4 * i;
      this.indices[arrayOffset] = nextIndex + 2;
      this.indices[arrayOffset + 1] = nextIndex + 1;
      this.indices[arrayOffset + 2] = nextIndex;
      this.indices[arrayOffset + 3] = nextIndex + 1;
      this.indices[arrayOffset + 4] = nextIndex + 2;
      this.indices[arrayOffset + 5] = nextIndex + 3;
    }
  }

  fillOffsets(points: THREE.Vector3[]) {
    const startPoint = indexOrThrow(points, 0);
    let endPoint = indexOrThrow(points, 1);
    let nextPoint = indexOrThrow(points, Math.min(2, points.length - 1));
    let startLength = 0;
    let endLength = startPoint.distanceTo(endPoint);
    let prevLength = 0;
    let nextLength = endLength + endPoint.distanceTo(nextPoint);

    this.writeVector4ToSegment(this.positionOffset, 0, {
      x: startLength,
      y: endLength,
      z: prevLength,
      w: nextLength,
    });

    const strokeSegmentCount = points.length - 1;
    for (let i = 1; i < strokeSegmentCount; i++) {
      const endPoint = indexOrThrow(points, i + 1);
      const nextPoint = indexOrThrow(
        points,
        Math.min(i + 2, points.length - 1),
      );

      const prevArrayOffset = 16 * (i - 1);
      const prevLength = bufferIndexOrThrow(
        this.positionOffset,
        prevArrayOffset,
      );
      const startLength = bufferIndexOrThrow(
        this.positionOffset,
        prevArrayOffset + 1,
      );
      const endLength = bufferIndexOrThrow(
        this.positionOffset,
        prevArrayOffset + 3,
      );
      const nextLength = endLength + endPoint.distanceTo(nextPoint);

      this.writeVector4ToSegment(this.positionOffset, i, {
        x: startLength,
        y: endLength,
        z: prevLength,
        w: nextLength,
      });
    }

    // NOTE: Arrow segments are skipped since they don't use this
    // data.
  }

  computeBoundingSphere(): void {
    if (this.boundingSphere === null) {
      this.boundingSphere = new THREE.Sphere();
    }
    this.computeBoundingSphereCenter(this.boundingSphere.center);
    this.computeBoundingSphereRadius(this.boundingSphere.center);
  }

  computeBoundingSphereCenter(center: THREE.Vector3) {
    center.set(0, 0, 0);

    let x: number | undefined;
    let y: number | undefined;
    let z: number | undefined;
    for (let i = 0; i < this.position.length; i += 12) {
      x = bufferIndexOrThrow(this.position, i);
      y = bufferIndexOrThrow(this.position, i + 1);
      z = bufferIndexOrThrow(this.position, i + 2);
      center.add({ x, y, z });
    }

    const arrayOffset = this.position.length - 12;
    x = bufferIndexOrThrow(this.endPosition, arrayOffset);
    y = bufferIndexOrThrow(this.endPosition, arrayOffset + 1);
    z = bufferIndexOrThrow(this.endPosition, arrayOffset + 2);
    center.add({ x, y, z });

    center.divideScalar(this.position.length / 12 + 1);
  }

  computeBoundingSphereRadius(center: THREE.Vector3) {
    let radius = 0;

    let x: number | undefined;
    let y: number | undefined;
    let z: number | undefined;
    for (let i = 0; i < this.position.length; i += 12) {
      x = bufferIndexOrThrow(this.position, i);
      y = bufferIndexOrThrow(this.position, i + 1);
      z = bufferIndexOrThrow(this.position, i + 2);
      radius = Math.max(radius, center.distanceTo({ x, y, z }));
    }

    const arrayOffset = this.position.length - 12;
    x = bufferIndexOrThrow(this.endPosition, arrayOffset);
    y = bufferIndexOrThrow(this.endPosition, arrayOffset + 1);
    z = bufferIndexOrThrow(this.endPosition, arrayOffset + 2);
    radius = Math.max(radius, center.distanceTo({ x, y, z }));

    return radius;
  }
}

interface WritableArrayLike<T> {
  readonly length: number;
  [n: number]: T;
}
