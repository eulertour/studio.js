import * as THREE from "three/webgpu";
import { indexOrThrow } from "../../utils.js";

interface Attributes extends Record<string, THREE.BufferAttribute> {
  position: THREE.Float32BufferAttribute;
  endPosition: THREE.Float32BufferAttribute;
  previousPosition: THREE.Float32BufferAttribute;
  beforeArrow: THREE.Float32BufferAttribute;
  arrow: THREE.Float32BufferAttribute;
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
  beforeArrow = new Float32Array();
  arrow = new Float32Array();
  start = new Float32Array();
  bottom = new Float32Array();
  startLength = new Float32Array();
  endLength = new Float32Array();
  indices = new Uint16Array();

  constructor(points: THREE.Vector3[]) {
    super();
    this.points = points;
    this.attributes = this.allocateNewBuffers(points.length);
    this.fillBuffersFromPoints(points);
    this.setAttributes(this.attributes);
  }

  fillBuffersFromPoints(points: Array<THREE.Vector3>, updateBounds = true) {
    const sizeChanged = this.position.length / 12 + 1 !== points.length;

    for (let i = 0; i < points.length - 1; i++) {
      this.addSegment(i, points);
    }

    this.attributes.position.needsUpdate = true;
    this.attributes.endPosition.needsUpdate = true;
    this.attributes.previousPosition.needsUpdate = true;
    this.attributes.startLength.needsUpdate = true;
    this.attributes.endLength.needsUpdate = true;
    this.attributes.index.needsUpdate = sizeChanged;

    if (updateBounds) {
      this.computeBoundingSphere();
      this.computeBoundingBox();
    }
  }

  addSegment(segmentIndex: number, points: THREE.Vector3[]) {
    let x: number;
    let y: number;
    let z: number;

    const previousPosition = indexOrThrow(
      points,
      Math.max(segmentIndex - 1, 0),
    );
    ({ x, y, z } = previousPosition);
    this.writeTripleToSegment(this.previousPosition, segmentIndex, x, y, z);

    const startPosition = indexOrThrow(points, segmentIndex);
    ({ x, y, z } = startPosition);
    this.writeTripleToSegment(this.position, segmentIndex, x, y, z);

    const endPosition = indexOrThrow(points, segmentIndex + 1);
    ({ x, y, z } = indexOrThrow(points, segmentIndex + 1));
    this.writeTripleToSegment(this.endPosition, segmentIndex, x, y, z);

    this.setStart(this.start, segmentIndex);
    this.setBottom(this.bottom, segmentIndex);

    const startLength =
      segmentIndex === 0 ? 0 : this.endLength[4 * segmentIndex - 1];
    if (startLength === undefined) {
      throw new Error("Invalid array access");
    }
    const endLength = startLength + startPosition.distanceTo(endPosition);
    this.writeSingleToSegment(this.startLength, segmentIndex, startLength);
    this.writeSingleToSegment(this.endLength, segmentIndex, endLength);
    this.setIndices(this.indices, segmentIndex);
  }

  allocateNewBuffers(numberOfPoints: number) {
    // Remove the previous buffers from the GPU
    this.dispose();

    const numberOfSegments = numberOfPoints - 1;
    this.previousPosition = new Float32Array(12 * numberOfSegments);
    this.position = new Float32Array(12 * numberOfSegments);
    this.endPosition = new Float32Array(12 * numberOfSegments);
    this.beforeArrow = new Float32Array(4 * numberOfSegments);
    this.arrow = new Float32Array(4 * numberOfSegments);
    this.start = new Float32Array(4 * numberOfSegments);
    this.bottom = new Float32Array(4 * numberOfSegments);
    this.startLength = new Float32Array(4 * numberOfSegments);
    this.endLength = new Float32Array(4 * numberOfSegments);
    this.indices = new Uint16Array(6 * numberOfSegments);

    return {
      previousPosition: new THREE.BufferAttribute(this.previousPosition, 3),
      position: new THREE.BufferAttribute(this.position, 3),
      endPosition: new THREE.BufferAttribute(this.endPosition, 3),
      beforeArrow: new THREE.BufferAttribute(this.beforeArrow, 1),
      arrow: new THREE.BufferAttribute(this.arrow, 1),
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
    this.setAttribute("beforeArrow", attributes.beforeArrow);
    this.setAttribute("arrow", attributes.arrow);
    this.setAttribute("start", attributes.start);
    this.setAttribute("bottom", attributes.bottom);
    this.setAttribute("startLength", attributes.startLength);
    this.setAttribute("endLength", attributes.endLength);
    this.setIndex(attributes.index);
  }

  writeSingleToSegment(
    array: WritableArrayLike<number>,
    offset: number,
    x: number,
  ) {
    array[4 * offset] = x;
    array[4 * offset + 1] = x;
    array[4 * offset + 2] = x;
    array[4 * offset + 3] = x;
  }

  writeTripleToSegment(
    array: WritableArrayLike<number>,
    offset: number,
    x: number,
    y: number,
    z: number,
  ) {
    array[12 * offset] = x;
    array[12 * offset + 1] = y;
    array[12 * offset + 2] = z;
    array[12 * offset + 3] = x;
    array[12 * offset + 4] = y;
    array[12 * offset + 5] = z;
    array[12 * offset + 6] = x;
    array[12 * offset + 7] = y;
    array[12 * offset + 8] = z;
    array[12 * offset + 9] = x;
    array[12 * offset + 10] = y;
    array[12 * offset + 11] = z;
  }

  // These are used to specify where each vertex falls on the line.
  // y ^
  //   |                  3
  // 0 *-----------------*
  //   |                 |
  //   |                 |
  //   |                 |
  //   *-----------------*--> x
  // 1                   2
  setTextureCoords(array: WritableArrayLike<number>, segmentIndex: number) {
    array[4 * segmentIndex] = 1; // 8 * 0 + 4 * 0 + 2 * 0 + 1;
    // array[4 * segmentIndex + 1] = 0; // 8 * 0 + 4 * 0 + 2 * 0 + 0;
    array[4 * segmentIndex + 2] = 2; // 8 * 0 + 4 * 0 + 2 * 1 + 0;
    array[4 * segmentIndex + 3] = 3; // 8 * 0 + 4 * 0 + 2 * 1 + 1;
  }

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
