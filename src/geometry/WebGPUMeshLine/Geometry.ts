import * as THREE from "three/webgpu";
import { indexOrThrow, bufferIndexOrThrow } from "../../utils.js";

export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
  // NOTE: The vertexOffset attribute is used to expand the segments
  // between consecutive points into quads in the vertex shader. The
  // other attributes are duplicated across each vertex in a segment
  // to be used in the fragment shader.
  position = new Float32Array();
  endPosition = new Float32Array();
  prevPosition = new Float32Array();
  startLength = new Float32Array();
  endLength = new Float32Array();
  prevLength = new Float32Array();
  vertexOffset = new Float32Array();
  indices = new Uint16Array();

  constructor(points: THREE.Vector3[]) {
    super();
    this.setPoints(points);
  }

  setPoints(points: Array<THREE.Vector3>, updateBounds = true) {
    const sizeChanged = this.position.length / 12 + 1 !== points.length;
    if (sizeChanged) {
      this.allocateNewBuffers(points.length - 1);
    } else {
      this.setNeedsUpdate(false);
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
    this.startLength = new Float32Array(4 * numberOfSegments);
    this.endLength = new Float32Array(4 * numberOfSegments);
    this.prevLength = new Float32Array(4 * numberOfSegments);
    this.vertexOffset = new Float32Array(8 * numberOfSegments);
    this.indices = new Uint16Array(6 * numberOfSegments);

    const positionBuffer = new THREE.BufferAttribute(this.position, 3);
    const endPositionBuffer = new THREE.BufferAttribute(this.endPosition, 3);
    const prevPositionBuffer = new THREE.BufferAttribute(this.prevPosition, 3);
    const startLengthBuffer = new THREE.BufferAttribute(this.startLength, 1);
    const endLengthBuffer = new THREE.BufferAttribute(this.endLength, 1);
    const prevLengthBuffer = new THREE.BufferAttribute(this.prevLength, 1);
    const vertexOffsetBuffer = new THREE.BufferAttribute(this.vertexOffset, 2);
    const indexBuffer = new THREE.BufferAttribute(this.indices, 1);

    this.setAttribute("position", positionBuffer);
    this.setAttribute("endPosition", endPositionBuffer);
    this.setAttribute("prevPosition", prevPositionBuffer);
    this.setAttribute("startLength", startLengthBuffer);
    this.setAttribute("endLength", endLengthBuffer);
    this.setAttribute("prevLength", prevLengthBuffer);
    this.setAttribute("vertexOffset", vertexOffsetBuffer);
    this.setIndex(indexBuffer);

    this.setNeedsUpdate(true);
  }

  setNeedsUpdate(sizeChanged: boolean) {
    this.getAttribute("position").needsUpdate = true;
    this.getAttribute("endPosition").needsUpdate = true;
    this.getAttribute("prevPosition").needsUpdate = true;
    this.getAttribute("startLength").needsUpdate = true;
    this.getAttribute("endLength").needsUpdate = true;
    this.getAttribute("prevLength").needsUpdate = true;
    this.getAttribute("vertexOffset").needsUpdate = sizeChanged;
    if (this.index !== null) {
      this.index.needsUpdate = sizeChanged;
    }
  }

  fillBuffers(points: THREE.Vector3[]) {
    this.fillPoints(points);
    this.fillVertexOffsets(points.length - 1);
    this.fillLengths(points);
    this.fillIndices(points.length - 1);
  }

  fillPoints(points: THREE.Vector3[]) {
    for (let i = 0; i < points.length - 1; i++) {
      const startPoint = indexOrThrow(points, i);
      const endPoint = indexOrThrow(points, i + 1);
      const prevPoint = indexOrThrow(points, Math.max(i - 1, 0));
      this.writeVector3ToSegment(this.position, i, startPoint);
      this.writeVector3ToSegment(this.endPosition, i, endPoint);
      this.writeVector3ToSegment(this.prevPosition, i, prevPoint);
    }
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
  fillVertexOffsets(segmentCount: number) {
    for (let i = 0; i < segmentCount; i++) {
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
      this.indices[arrayOffset + 2] = nextIndex + 0;
      this.indices[arrayOffset + 3] = nextIndex + 1;
      this.indices[arrayOffset + 4] = nextIndex + 2;
      this.indices[arrayOffset + 5] = nextIndex + 3;
    }
  }

  fillLengths(points: THREE.Vector3[]) {
    const segmentCount = points.length - 1;
    for (let i = 0; i < segmentCount; i++) {
      const startPoint = indexOrThrow(points, i);
      const endPoint = indexOrThrow(points, i + 1);

      const prevArrayOffset = Math.max(4 * (i - 1), 0);
      const startLength = bufferIndexOrThrow(this.endLength, prevArrayOffset);
      const endLength = startLength + startPoint.distanceTo(endPoint);
      const prevLength = bufferIndexOrThrow(this.startLength, prevArrayOffset);

      const arrayOffset = 4 * i;
      this.startLength[arrayOffset] = startLength;
      this.startLength[arrayOffset + 1] = startLength;
      this.startLength[arrayOffset + 2] = startLength;
      this.startLength[arrayOffset + 3] = startLength;
      this.endLength[arrayOffset] = endLength;
      this.endLength[arrayOffset + 1] = endLength;
      this.endLength[arrayOffset + 2] = endLength;
      this.endLength[arrayOffset + 3] = endLength;
      this.prevLength[arrayOffset] = prevLength;
      this.prevLength[arrayOffset + 1] = prevLength;
      this.prevLength[arrayOffset + 2] = prevLength;
      this.prevLength[arrayOffset + 3] = prevLength;
    }
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
      x = this.position[i];
      y = this.position[i + 1];
      z = this.position[i + 2];
      if (x === undefined || y === undefined || z === undefined) {
        throw new Error("Invalid array access");
      }
      center.add({ x, y, z });
    }

    const arrayOffset = this.position.length - 12;
    x = this.endPosition[arrayOffset];
    y = this.endPosition[arrayOffset + 1];
    z = this.endPosition[arrayOffset + 2];
    if (x === undefined || y === undefined || z === undefined) {
      throw new Error("Invalid array access");
    }

    center.divideScalar(this.position.length / 12 + 1);
  }

  computeBoundingSphereRadius(center: THREE.Vector3) {
    let radius = 0;

    let x: number | undefined;
    let y: number | undefined;
    let z: number | undefined;
    for (let i = 0; i < this.position.length; i += 12) {
      x = this.position[i];
      y = this.position[i + 1];
      z = this.position[i + 2];
      if (x === undefined || y === undefined || z === undefined) {
        throw new Error("Invalid array access");
      }
      radius = Math.max(radius, center.distanceTo({ x, y, z }));
    }

    const arrayOffset = this.position.length - 12;
    x = this.endPosition[arrayOffset];
    y = this.endPosition[arrayOffset + 1];
    z = this.endPosition[arrayOffset + 2];
    if (x === undefined || y === undefined || z === undefined) {
      throw new Error("Invalid array access");
    }
    radius = Math.max(radius, center.distanceTo({ x, y, z }));

    return radius;
  }
}

interface WritableArrayLike<T> {
  readonly length: number;
  [n: number]: T;
}
