import * as THREE from "three/webgpu";
import { indexOrThrow } from "../../utils.js";

interface Attributes extends Record<string, THREE.BufferAttribute> {
  position: THREE.Float32BufferAttribute;
  endPosition: THREE.Float32BufferAttribute;
  previousPosition: THREE.Float32BufferAttribute;
  vertexOffset: THREE.Float32BufferAttribute;
  startLength: THREE.Float32BufferAttribute;
  endLength: THREE.Float32BufferAttribute;
  index: THREE.Uint16BufferAttribute;
}

export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
  attributes: Attributes;

  // NOTE: The vertexOffset attribute is used to expand the segments
  // between consecutive points into quads in the vertex shader. The
  // other attributes are duplicated across each vertex in a segment
  // to be used in the fragment shader.
  position = new Float32Array();
  endPosition = new Float32Array();
  previousPosition = new Float32Array();
  vertexOffset = new Float32Array();
  startLength = new Float32Array();
  endLength = new Float32Array();
  indices = new Uint16Array();

  constructor(points: THREE.Vector3[]) {
    super();
    this.attributes = this.allocateNewBuffers(points.length - 1);
    this.setPoints(points);
    this.setAttributes(this.attributes);
  }

  setPoints(points: Array<THREE.Vector3>, updateBounds = true) {
    const sizeChanged = this.position.length / 12 + 1 !== points.length;
    if (sizeChanged) {
      this.attributes = this.allocateNewBuffers(points.length - 1);
    }
    this.fillBuffers(points);
    this.setNeedsUpdate(sizeChanged);
    if (updateBounds) {
      this.computeBoundingSphere();
      this.computeBoundingBox();
    }
  }

  allocateNewBuffers(numberOfSegments: number) {
    this.dispose();

    this.previousPosition = new Float32Array(12 * numberOfSegments);
    this.position = new Float32Array(12 * numberOfSegments);
    this.endPosition = new Float32Array(12 * numberOfSegments);
    this.vertexOffset = new Float32Array(8 * numberOfSegments);
    this.startLength = new Float32Array(4 * numberOfSegments);
    this.endLength = new Float32Array(4 * numberOfSegments);
    this.indices = new Uint16Array(6 * numberOfSegments);

    return {
      previousPosition: new THREE.BufferAttribute(this.previousPosition, 3),
      position: new THREE.BufferAttribute(this.position, 3),
      endPosition: new THREE.BufferAttribute(this.endPosition, 3),
      vertexOffset: new THREE.BufferAttribute(this.vertexOffset, 2),
      startLength: new THREE.BufferAttribute(this.startLength, 1),
      endLength: new THREE.BufferAttribute(this.endLength, 1),
      index: new THREE.BufferAttribute(this.indices, 1),
    };
  }

  setAttributes(attributes: Attributes) {
    this.setAttribute("position", attributes.position);
    this.setAttribute("endPosition", attributes.endPosition);
    this.setAttribute("previousPosition", attributes.previousPosition);
    this.setAttribute("vertexOffset", attributes.vertexOffset);
    this.setAttribute("startLength", attributes.startLength);
    this.setAttribute("endLength", attributes.endLength);
    this.setIndex(attributes.index);
  }

  fillBuffers(points: THREE.Vector3[]) {
    this.fillPreviousPosition(points);
    this.fillStartPosition(points);
    this.fillEndPosition(points);
    this.fillVertexOffset(points.length - 1);
    this.fillLengths(points);
    this.fillIndices(points.length - 1);
  }

  fillPreviousPosition(points: THREE.Vector3[]) {
    for (
      let segmentIndex = 0;
      segmentIndex < points.length - 1;
      segmentIndex++
    ) {
      const previousPosition = indexOrThrow(
        points,
        Math.max(segmentIndex - 1, 0),
      );
      this.writeVector3ToSegment(
        this.previousPosition,
        segmentIndex,
        previousPosition,
      );
    }
  }

  fillStartPosition(points: THREE.Vector3[]) {
    for (
      let segmentIndex = 0;
      segmentIndex < points.length - 1;
      segmentIndex++
    ) {
      const startPosition = indexOrThrow(points, segmentIndex);
      this.writeVector3ToSegment(this.position, segmentIndex, startPosition);
    }
  }

  fillEndPosition(points: THREE.Vector3[]) {
    for (
      let segmentIndex = 0;
      segmentIndex < points.length - 1;
      segmentIndex++
    ) {
      const endPosition = indexOrThrow(points, segmentIndex + 1);
      this.writeVector3ToSegment(this.endPosition, segmentIndex, endPosition);
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

  // NOTE: The vertices specifying a segment are ordered
  // according to this diagram.
  // y ^
  //   |                  3
  // 0 *-----------------*
  //   |                 |
  //   |                 |
  //   |                 |
  //   *-----------------*--> x
  // 1                   2
  fillVertexOffset(segmentCount: number) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const arrayOffset = 8 * segmentIndex;
      this.vertexOffset[arrayOffset] = -1;
      this.vertexOffset[arrayOffset + 1] = 1;
      this.vertexOffset[arrayOffset + 2] = -1;
      this.vertexOffset[arrayOffset + 3] = -1;
      this.vertexOffset[arrayOffset + 4] = 1;
      this.vertexOffset[arrayOffset + 5] = -1;
      this.vertexOffset[arrayOffset + 6] = 1;
      this.vertexOffset[arrayOffset + 7] = 1;
    }
  }

  // NOTE: The indices are chosen to construct the segment
  // as shown here.
  // 0, 3              5
  // *-----------------*
  // |                 |
  // |                 |
  // |                 |
  // *-----------------*
  // 1                 2, 4
  fillIndices(segmentCount: number) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const arrayOffset = 6 * segmentIndex;
      const nextIndex = 4 * segmentIndex;
      this.indices[arrayOffset] = nextIndex;
      this.indices[arrayOffset + 1] = nextIndex + 1;
      this.indices[arrayOffset + 2] = nextIndex + 2;
      this.indices[arrayOffset + 3] = nextIndex;
      this.indices[arrayOffset + 4] = nextIndex + 2;
      this.indices[arrayOffset + 5] = nextIndex + 3;
    }
  }

  fillLengths(points: THREE.Vector3[]) {
    const segmentCount = points.length - 1;
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const startPosition = indexOrThrow(points, segmentIndex);
      const endPosition = indexOrThrow(points, segmentIndex + 1);

      const startLength =
        segmentIndex === 0 ? 0 : this.endLength[4 * segmentIndex - 1];
      if (startLength === undefined) {
        throw new Error("Invalid array access");
      }
      const endLength = startLength + startPosition.distanceTo(endPosition);

      const arrayOffset = 4 * segmentIndex;
      this.startLength[arrayOffset] = startLength;
      this.startLength[arrayOffset + 1] = startLength;
      this.startLength[arrayOffset + 2] = startLength;
      this.startLength[arrayOffset + 3] = startLength;
      this.endLength[arrayOffset] = endLength;
      this.endLength[arrayOffset + 1] = endLength;
      this.endLength[arrayOffset + 2] = endLength;
      this.endLength[arrayOffset + 3] = endLength;
    }
  }

  setNeedsUpdate(sizeChanged: boolean) {
    this.attributes.position.needsUpdate = true;
    this.attributes.endPosition.needsUpdate = true;
    this.attributes.previousPosition.needsUpdate = true;
    this.attributes.startLength.needsUpdate = true;
    this.attributes.endLength.needsUpdate = true;
    this.attributes.index.needsUpdate = sizeChanged;
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
