import * as THREE from "three/webgpu";
import { indexOrThrow } from "../../utils.js";

interface Attributes extends Record<string, THREE.BufferAttribute> {
  position: THREE.Float32BufferAttribute;
  endPosition: THREE.Float32BufferAttribute;
  previousPosition: THREE.Float32BufferAttribute;
  start: THREE.Float32BufferAttribute;
  bottom: THREE.Float32BufferAttribute;
  startLength: THREE.Float32BufferAttribute;
  endLength: THREE.Float32BufferAttribute;
  index: THREE.Uint16BufferAttribute;
}

export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
  points: THREE.Vector3[];
  attributes: Attributes;

  position = new Float32Array();
  endPosition = new Float32Array();
  previousPosition = new Float32Array();
  start = new Float32Array();
  bottom = new Float32Array();
  startLength = new Float32Array();
  endLength = new Float32Array();
  indices = new Uint16Array();

  constructor(points: THREE.Vector3[]) {
    super();
    this.points = points;
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

  setNeedsUpdate(sizeChanged: boolean) {
    this.attributes.position.needsUpdate = true;
    this.attributes.endPosition.needsUpdate = true;
    this.attributes.previousPosition.needsUpdate = true;
    this.attributes.startLength.needsUpdate = true;
    this.attributes.endLength.needsUpdate = true;
    this.attributes.index.needsUpdate = sizeChanged;
  }

  fillBuffers(points: THREE.Vector3[]) {
    this.fillPreviousPosition(points);
    this.fillStartPosition(points);
    this.fillEndPosition(points);
    this.fillStart(points.length - 1);
    this.fillBottom(points.length - 1);

    for (let segmentIndex = 0; segmentIndex < points.length - 1; segmentIndex++) {
      const startPosition = indexOrThrow(points, segmentIndex);
      const endPosition = indexOrThrow(points, segmentIndex + 1);
      const startLength = segmentIndex === 0 ? 0 : this.endLength[4 * segmentIndex - 1];
      if (startLength === undefined) {
        throw new Error("Invalid array access");
      }
      const endLength = startLength + startPosition.distanceTo(endPosition);
      this.writeSingleToSegment(this.startLength, segmentIndex, startLength);
      this.writeSingleToSegment(this.endLength, segmentIndex, endLength);
      this.setIndices(this.indices, segmentIndex);
    }
  }

  fillPreviousPosition(points: THREE.Vector3[]) {
    for (let segmentIndex = 0; segmentIndex < points.length - 1; segmentIndex++) {
      const previousPosition = indexOrThrow(
        points,
        Math.max(segmentIndex - 1, 0),
      );
      this.writeVector3ToSegment(this.previousPosition, segmentIndex, previousPosition);
    }
  }

  fillStartPosition(points: THREE.Vector3[]) {
    for (let segmentIndex = 0; segmentIndex < points.length - 1; segmentIndex++) {
      const startPosition = indexOrThrow(points, segmentIndex);
      this.writeVector3ToSegment(this.position, segmentIndex, startPosition);
    }
  }

  fillEndPosition(points: THREE.Vector3[]) {
    for (let segmentIndex = 0; segmentIndex < points.length - 1; segmentIndex++) {
      const endPosition = indexOrThrow(points, segmentIndex + 1);
      this.writeVector3ToSegment(this.endPosition, segmentIndex, endPosition);
    }
  }

  fillStart(segmentCount: number) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const offset = 4 * segmentIndex;
      this.start[offset] = 1;
      this.start[offset + 1] = 1;
      this.start[offset + 2] = 0;
      this.start[offset + 3] = 0;
    }
  }

  fillBottom(segmentCount: number) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const offset = 4 * segmentIndex;
      this.bottom[offset] = 0;
      this.bottom[offset + 1] = 1;
      this.bottom[offset + 2] = 1;
      this.bottom[offset + 3] = 0;
    }
  }

  allocateNewBuffers(numberOfSegments: number) {
    // Remove the previous buffers from the GPU
    this.dispose();

    this.previousPosition = new Float32Array(12 * numberOfSegments);
    this.position = new Float32Array(12 * numberOfSegments);
    this.endPosition = new Float32Array(12 * numberOfSegments);
    this.start = new Float32Array(4 * numberOfSegments);
    this.bottom = new Float32Array(4 * numberOfSegments);
    this.startLength = new Float32Array(4 * numberOfSegments);
    this.endLength = new Float32Array(4 * numberOfSegments);
    this.indices = new Uint16Array(6 * numberOfSegments);

    return {
      previousPosition: new THREE.BufferAttribute(this.previousPosition, 3),
      position: new THREE.BufferAttribute(this.position, 3),
      endPosition: new THREE.BufferAttribute(this.endPosition, 3),
      start: new THREE.BufferAttribute(this.start, 1),
      bottom: new THREE.BufferAttribute(this.bottom, 1),
      startLength: new THREE.BufferAttribute(this.startLength, 1),
      endLength: new THREE.BufferAttribute(this.endLength, 1),
      index: new THREE.BufferAttribute(this.indices, 1),
    };
  }

  setAttributes(attributes: Attributes) {
    this.setAttribute("position", attributes.position);
    this.setAttribute("endPosition", attributes.endPosition);
    this.setAttribute("previousPosition", attributes.previousPosition);
    this.setAttribute("start", attributes.start);
    this.setAttribute("bottom", attributes.bottom);
    this.setAttribute("startLength", attributes.startLength);
    this.setAttribute("endLength", attributes.endLength);
    this.setIndex(attributes.index);
  }

  writeSingleToSegment(
    array: WritableArrayLike<number>,
    segmentIndex: number,
    x: number,
  ) {
    const offset = 4 * segmentIndex;
    array[offset] = x;
    array[offset + 1] = x;
    array[offset + 2] = x;
    array[offset + 3] = x;
  }

  writeVector3ToSegment(
    array: WritableArrayLike<number>,
    segmentIndex: number,
    v: THREE.Vector3,
  ) {
    const { x, y, z } = v;
    const offset = 12 * segmentIndex;
    array[offset] = x;
    array[offset + 1] = y;
    array[offset + 2] = z;
    array[offset + 3] = x;
    array[offset + 4] = y;
    array[offset + 5] = z;
    array[offset + 6] = x;
    array[offset + 7] = y;
    array[offset + 8] = z;
    array[offset + 9] = x;
    array[offset + 10] = y;
    array[offset + 11] = z;
  }

  // The vertices specifying a segment are ordered
  // according to this diagram.
  // y ^
  //   |                  3
  // 0 *-----------------*
  //   |                 |
  //   |                 |
  //   |                 |
  //   *-----------------*--> x
  // 1                   2
  setStart(array: WritableArrayLike<number>, segmentIndex: number) {
    array[4 * segmentIndex] = 1;
    array[4 * segmentIndex + 1] = 1;
    array[4 * segmentIndex + 2] = 0;
    array[4 * segmentIndex + 3] = 0;
  }

  setBottom(array: WritableArrayLike<number>, segmentIndex: number) {
    array[4 * segmentIndex] = 0;
    array[4 * segmentIndex + 1] = 1;
    array[4 * segmentIndex + 2] = 1;
    array[4 * segmentIndex + 3] = 0;
  }

  // The indices are chosen to construct the segment
  // as shown here.
  // 0, 3              5
  // *-----------------*
  // |                 |
  // |                 |
  // |                 |
  // *-----------------*
  // 1                 2, 4
  setIndices(array: WritableArrayLike<number>, segmentIndex: number) {
    array[6 * segmentIndex] = 4 * segmentIndex;
    array[6 * segmentIndex + 1] = 4 * segmentIndex + 1;
    array[6 * segmentIndex + 2] = 4 * segmentIndex + 2;
    array[6 * segmentIndex + 3] = 4 * segmentIndex;
    array[6 * segmentIndex + 4] = 4 * segmentIndex + 2;
    array[6 * segmentIndex + 5] = 4 * segmentIndex + 3;
  }

  computeBoundingSphere(): void {
    if (this.boundingSphere === null) {
      this.boundingSphere = new THREE.Sphere();
    }

    const center = new THREE.Vector3();
    for (const point of this.points) {
      this.boundingSphere.center.add(point);
    }
    this.boundingSphere.center.divideScalar(this.points.length);

    this.boundingSphere.radius = 0;
    for (const point of this.points) {
      this.boundingSphere.radius = Math.max(
        this.boundingSphere.radius,
        center.distanceTo(point),
      );
    }
  }
}

interface WritableArrayLike<T> {
  readonly length: number;
  [n: number]: T;
}
