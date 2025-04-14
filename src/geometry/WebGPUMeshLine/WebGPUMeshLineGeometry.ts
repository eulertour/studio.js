import * as THREE from "three/webgpu";
import { indexOrThrow } from "../../utils.js";

interface Attributes extends Record<string, THREE.BufferAttribute> {
  position: THREE.Float32BufferAttribute;
  endPosition: THREE.Float32BufferAttribute;
  previousPosition: THREE.Float32BufferAttribute;
  isStart: THREE.Float32BufferAttribute;
  isBottom: THREE.Float32BufferAttribute;
  startLength: THREE.Float32BufferAttribute;
  endLength: THREE.Float32BufferAttribute;
  index: THREE.Uint16BufferAttribute;
}

export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
  attributes: Attributes;

  position = new Float32Array();
  endPosition = new Float32Array();
  previousPosition = new Float32Array();
  isStart = new Float32Array();
  isBottom = new Float32Array();
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
    this.isStart = new Float32Array(4 * numberOfSegments);
    this.isBottom = new Float32Array(4 * numberOfSegments);
    this.startLength = new Float32Array(4 * numberOfSegments);
    this.endLength = new Float32Array(4 * numberOfSegments);
    this.indices = new Uint16Array(6 * numberOfSegments);

    return {
      previousPosition: new THREE.BufferAttribute(this.previousPosition, 3),
      position: new THREE.BufferAttribute(this.position, 3),
      endPosition: new THREE.BufferAttribute(this.endPosition, 3),
      isStart: new THREE.BufferAttribute(this.isStart, 1),
      isBottom: new THREE.BufferAttribute(this.isBottom, 1),
      startLength: new THREE.BufferAttribute(this.startLength, 1),
      endLength: new THREE.BufferAttribute(this.endLength, 1),
      index: new THREE.BufferAttribute(this.indices, 1),
    };
  }

  setAttributes(attributes: Attributes) {
    this.setAttribute("position", attributes.position);
    this.setAttribute("endPosition", attributes.endPosition);
    this.setAttribute("previousPosition", attributes.previousPosition);
    this.setAttribute("isStart", attributes.isStart);
    this.setAttribute("isBottom", attributes.isBottom);
    this.setAttribute("startLength", attributes.startLength);
    this.setAttribute("endLength", attributes.endLength);
    this.setIndex(attributes.index);
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
    this.fillIsStart(points.length - 1);
    this.fillIsBottom(points.length - 1);
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
  fillIsStart(segmentCount: number) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const offset = 4 * segmentIndex;
      this.isStart[offset] = 1;
      this.isStart[offset + 1] = 1;
      this.isStart[offset + 2] = 0;
      this.isStart[offset + 3] = 0;
    }
  }

  fillIsBottom(segmentCount: number) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const offset = 4 * segmentIndex;
      this.isBottom[offset] = 0;
      this.isBottom[offset + 1] = 1;
      this.isBottom[offset + 2] = 1;
      this.isBottom[offset + 3] = 0;
    }
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
  fillIndices(segmentCount: number) {
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const offset = 6 * segmentIndex;
      const nextIndex = 4 * segmentIndex;
      this.indices[offset] = nextIndex;
      this.indices[offset + 1] = nextIndex + 1;
      this.indices[offset + 2] = nextIndex + 2;
      this.indices[offset + 3] = nextIndex;
      this.indices[offset + 4] = nextIndex + 2;
      this.indices[offset + 5] = nextIndex + 3;
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

      this.writeFloatToSegment(this.startLength, segmentIndex, startLength);
      this.writeFloatToSegment(this.endLength, segmentIndex, endLength);
    }
  }

  writeFloatToSegment(
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

    const offset = this.position.length - 12;
    x = this.endPosition[offset];
    y = this.endPosition[offset + 1];
    z = this.endPosition[offset + 2];
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

    const offset = this.position.length - 12;
    x = this.endPosition[offset];
    y = this.endPosition[offset + 1];
    z = this.endPosition[offset + 2];
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
