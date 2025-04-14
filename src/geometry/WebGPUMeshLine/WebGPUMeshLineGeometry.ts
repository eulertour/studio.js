import * as THREE from "three/webgpu";
import { indexOrThrow } from "../../utils.js";
import { ERROR_THRESHOLD } from "../../constants.js";

interface Attributes extends Record<string, THREE.BufferAttribute> {
  position: THREE.Float32BufferAttribute;
  endPosition: THREE.Float32BufferAttribute;
  nextPosition: THREE.Float32BufferAttribute;
  previousPosition: THREE.Float32BufferAttribute;
  textureCoords: THREE.Float32BufferAttribute;
  beforeArrow: THREE.Float32BufferAttribute;
  arrow: THREE.Float32BufferAttribute;
  start: THREE.Float32BufferAttribute;
  bottom: THREE.Float32BufferAttribute;
  startProportion: THREE.Float32BufferAttribute;
  endProportion: THREE.Float32BufferAttribute;
  index: THREE.Uint16BufferAttribute;
}

export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
  attributes: Attributes;

  position = new Float32Array();
  endPosition = new Float32Array();
  nextPosition = new Float32Array();
  previousPosition = new Float32Array();
  textureCoords = new Float32Array();
  beforeArrow = new Float32Array();
  arrow = new Float32Array();
  start = new Float32Array();
  bottom = new Float32Array();
  startProportion = new Float32Array();
  endProportion = new Float32Array();
  indices = new Uint16Array();

  constructor(public points: THREE.Vector3[]) {
    super();
    this.attributes = this.allocateNewBuffers(points.length);
    this.fillBuffersFromPoints(points);
    this.setAttributes(this.attributes);
  }

  fillBuffersFromPoints(points: Array<THREE.Vector3>, updateBounds = true) {
    const sizeChanged = this.points.length !== points.length;
    this.points = points;

    const lengths = new Float32Array(this.points.length);
    lengths[0] = 0;

    const firstPoint = points.at(0);
    const lastPoint = points.at(-1);
    if (firstPoint === undefined || lastPoint === undefined) {
      throw new Error("invalid endpoints");
    }

    // NOTE: If the first and last points are the same, the previous point
    // for the first segment is the first point of the last segment.
    let previousPosition =
      firstPoint.distanceTo(lastPoint) < 0.001 ? points.at(-1) : points.at(0);

    let nextPosition = points.length < 3 ? points[1] : points[2];

    let position = points[0];
    let endPosition = points[1];
    let previousLength = lengths[0];
    if (
      previousPosition === undefined ||
      position === undefined ||
      endPosition === undefined ||
      nextPosition === undefined ||
      previousLength === undefined
    ) {
      throw new Error("point missing");
    }
    this.addSegment(0, lengths, previousLength);

    for (let i = 1; i < this.points.length - 2; i++) {
      const previousPosition = points[i - 1];
      const position = points[i];
      const endPosition = points[i + 1];
      const nextPosition = points[i + 2];
      const previousLength = lengths[i];
      if (
        previousPosition === undefined ||
        position === undefined ||
        endPosition === undefined ||
        nextPosition === undefined ||
        previousLength === undefined
      ) {
        throw new Error("point missing");
      }
      this.addSegment(i, lengths, previousLength);
    }

    // Handle the case where the first and last points are the same.
    if (
      new THREE.Vector3().subVectors(firstPoint, lastPoint).length() < 0.001
    ) {
      nextPosition = points.at(1);
    } else {
      nextPosition = points.at(-1);
    }

    if (points.length < 3) {
      previousPosition = points.at(-2);
    } else {
      previousPosition = points.at(-3);
    }

    position = points.at(-2);
    endPosition = points.at(-1);
    previousLength = lengths.at(-2);
    if (
      previousPosition === undefined ||
      position === undefined ||
      endPosition === undefined ||
      nextPosition === undefined ||
      previousLength === undefined
    ) {
      throw new Error("point missing");
    }
    this.addSegment(points.length - 2, lengths, previousLength);

    if (this.arrow) {
      this.textureCoords[4 * (points.length - 3)] = 9; // 8 * 1 + 2 * 0 + 1;
      this.textureCoords[4 * (points.length - 3) + 1] = 8; // 8 * 1 + 2 * 0 + 0;
      this.textureCoords[4 * (points.length - 3) + 2] = 10; // 8 * 1 + 2 * 1 + 0;
      this.textureCoords[4 * (points.length - 3) + 3] = 11; // 8 * 1 + 2 * 1 + 1;

      this.textureCoords[4 * (points.length - 2)] = 5; // 4 * 1 + 2 * 0 + 1;
      this.textureCoords[4 * (points.length - 2) + 1] = 4; // 4 * 1 + 2 * 0 + 0;
      this.textureCoords[4 * (points.length - 2) + 2] = 6; // 4 * 1 + 2 * 1 + 0;
      this.textureCoords[4 * (points.length - 2) + 3] = 7; // 4 * 1 + 2 * 1 + 1;
    }

    const totalLength = lengths.at(-1);
    if (totalLength === undefined) {
      throw new Error("Invalid length");
    }
    for (let i = 0; i < this.points.length - 1; i++) {
      const startLength = lengths[i];
      const endLength = lengths[i + 1];
      if (startLength === undefined || endLength === undefined) {
        throw new Error("Invalid length");
      }
      const startProportion = startLength / totalLength;
      const endProportion = endLength / totalLength;
      const offset = 4 * i;
      this.startProportion[offset] = startProportion;
      this.startProportion[offset + 1] = startProportion;
      this.startProportion[offset + 2] = startProportion;
      this.startProportion[offset + 3] = startProportion;
      this.endProportion[offset] = endProportion;
      this.endProportion[offset + 1] = endProportion;
      this.endProportion[offset + 2] = endProportion;
      this.endProportion[offset + 3] = endProportion;
    }

    if (!this.attributes) throw new Error("missing attributes");
    this.attributes.position.needsUpdate = true;
    this.attributes.endPosition.needsUpdate = true;
    this.attributes.nextPosition.needsUpdate = true;
    this.attributes.previousPosition.needsUpdate = true;
    this.attributes.textureCoords.needsUpdate = sizeChanged;
    this.attributes.startProportion.needsUpdate = true;
    this.attributes.endProportion.needsUpdate = true;
    this.attributes.index.needsUpdate = sizeChanged;

    if (updateBounds) {
      this.computeBoundingSphere();
      this.computeBoundingBox();
    }
  }

  addSegment(
    segmentIndex: number,
    lengths: Float32Array,
    previousLength: number,
  ) {
    let previousPosition: THREE.Vector3;
    if (segmentIndex === 0) {
      previousPosition = indexOrThrow(this.points, 0);
    } else if (1 <= segmentIndex && segmentIndex < this.points.length - 2) {
      previousPosition = indexOrThrow(this.points, segmentIndex - 1);
    } else {
      if (this.points.length < 3) {
        previousPosition = indexOrThrow(this.points, this.points.length - 2);
      } else {
        previousPosition = indexOrThrow(this.points, this.points.length - 3);
      }
    }

    let startPosition: THREE.Vector3;
    if (segmentIndex === 0) {
      startPosition = indexOrThrow(this.points, 0);
    } else if (1 <= segmentIndex && segmentIndex < this.points.length - 2) {
      startPosition = indexOrThrow(this.points, segmentIndex);
    } else {
      startPosition = indexOrThrow(this.points, this.points.length - 2);
    }

    let endPosition: THREE.Vector3;
    if (segmentIndex === 0) {
      endPosition = indexOrThrow(this.points, 1);
    } else if (1 <= segmentIndex && segmentIndex < this.points.length - 2) {
      endPosition = indexOrThrow(this.points, segmentIndex + 1);
    } else {
      endPosition = indexOrThrow(this.points, this.points.length - 1);
    }

    let nextPosition: THREE.Vector3;
    if (segmentIndex === 0) {
      nextPosition = indexOrThrow(this.points, this.points.length < 3 ? 1 : 2);
    } else if (1 <= segmentIndex && segmentIndex < this.points.length - 2) {
      nextPosition = indexOrThrow(this.points, segmentIndex + 1);
    } else {
      const strokeIsClosed =
        new THREE.Vector3()
          .subVectors(
            indexOrThrow(this.points, 0),
            indexOrThrow(this.points, this.points.length - 1),
          )
          .length() < ERROR_THRESHOLD;
      nextPosition = indexOrThrow(
        this.points,
        strokeIsClosed ? 1 : this.points.length - 1,
      );
    }

    const vertexOffset = 12 * segmentIndex;
    let x: number;
    let y: number;
    let z: number;

    ({ x, y, z } = previousPosition);
    this.setVertexData(this.previousPosition, vertexOffset, x, y, z);

    ({ x, y, z } = startPosition);
    this.setVertexData(this.position, vertexOffset, startPosition.x, y, z);

    ({ x, y, z } = endPosition);
    this.setVertexData(this.endPosition, vertexOffset, x, y, z);

    ({ x, y, z } = nextPosition);
    this.setVertexData(this.nextPosition, vertexOffset, x, y, z);

    const textureOffset = 4 * segmentIndex;
    this.setTextureCoords(this.textureCoords, textureOffset);
    this.setStart(this.start, textureOffset);
    this.setBottom(this.bottom, textureOffset);

    lengths[segmentIndex + 1] =
      previousLength +
      ((startPosition.x - endPosition.x) ** 2 +
        (startPosition.y - endPosition.y) ** 2 +
        (startPosition.z - endPosition.z) ** 2) **
        0.5;

    const indexOffset = 6 * segmentIndex;
    const nextIndex = 4 * segmentIndex;
    this.setIndices(this.indices, indexOffset, nextIndex);
  }

  allocateNewBuffers(numberOfPoints: number) {
    // Remove the previous buffers from the GPU
    this.dispose();

    const numberOfSegments = numberOfPoints - 1;
    this.previousPosition = new Float32Array(12 * numberOfSegments);
    this.position = new Float32Array(12 * numberOfSegments);
    this.endPosition = new Float32Array(12 * numberOfSegments);
    this.nextPosition = new Float32Array(12 * numberOfSegments);
    this.textureCoords = new Float32Array(4 * numberOfSegments);
    this.beforeArrow = new Float32Array(4 * numberOfSegments);
    this.arrow = new Float32Array(4 * numberOfSegments);
    this.start = new Float32Array(4 * numberOfSegments);
    this.bottom = new Float32Array(4 * numberOfSegments);
    this.startProportion = new Float32Array(4 * numberOfSegments);
    this.endProportion = new Float32Array(4 * numberOfSegments);
    this.indices = new Uint16Array(6 * numberOfSegments);

    return {
      previousPosition: new THREE.BufferAttribute(this.previousPosition, 3),
      position: new THREE.BufferAttribute(this.position, 3),
      endPosition: new THREE.BufferAttribute(this.endPosition, 3),
      nextPosition: new THREE.BufferAttribute(this.nextPosition, 3),
      textureCoords: new THREE.BufferAttribute(this.textureCoords, 1),
      beforeArrow: new THREE.BufferAttribute(this.beforeArrow, 1),
      arrow: new THREE.BufferAttribute(this.arrow, 1),
      start: new THREE.BufferAttribute(this.start, 1),
      bottom: new THREE.BufferAttribute(this.bottom, 1),
      startProportion: new THREE.BufferAttribute(this.startProportion, 1),
      endProportion: new THREE.BufferAttribute(this.endProportion, 1),
      index: new THREE.BufferAttribute(this.indices, 1),
    };
  }

  setAttributes(attributes: Attributes) {
    this.setAttribute("position", attributes.position);
    this.setAttribute("endPosition", attributes.endPosition);
    this.setAttribute("nextPosition", attributes.nextPosition);
    this.setAttribute("previousPosition", attributes.previousPosition);
    this.setAttribute("textureCoords", attributes.textureCoords);
    this.setAttribute("beforeArrow", attributes.beforeArrow);
    this.setAttribute("arrow", attributes.arrow);
    this.setAttribute("start", attributes.start);
    this.setAttribute("bottom", attributes.bottom);
    this.setAttribute("startProportion", attributes.startProportion);
    this.setAttribute("endProportion", attributes.endProportion);
    this.setIndex(attributes.index);
  }

  setVertexData(
    array: WritableArrayLike<number>,
    offset: number,
    x: number,
    y: number,
    z: number,
  ) {
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

  // These are used to specify where each vertex falls on the line.
  // y ^
  //   |                  3
  // 0 *-----------------*
  //   |                 |
  //   |                 |
  //   |                 |
  //   *-----------------*--> x
  // 1                   2
  setTextureCoords(array: WritableArrayLike<number>, offset: number) {
    array[offset] = 1; // 8 * 0 + 4 * 0 + 2 * 0 + 1;
    // array[offset + 1] = 0; // 8 * 0 + 4 * 0 + 2 * 0 + 0;
    array[offset + 2] = 2; // 8 * 0 + 4 * 0 + 2 * 1 + 0;
    array[offset + 3] = 3; // 8 * 0 + 4 * 0 + 2 * 1 + 1;
  }

  setStart(array: WritableArrayLike<number>, offset: number) {
    array[offset] = 1;
    array[offset + 1] = 1;
    array[offset + 2] = 0;
    array[offset + 3] = 0;
  }

  setBottom(array: WritableArrayLike<number>, offset: number) {
    array[offset] = 0;
    array[offset + 1] = 1;
    array[offset + 2] = 1;
    array[offset + 3] = 0;
  }

  // 0, 3              5
  // *-----------------*
  // |                 |
  // |                 |
  // |                 |
  // *-----------------*
  // 1                 2, 4
  setIndices(
    array: WritableArrayLike<number>,
    offset: number,
    startIndex: number,
  ) {
    array[offset] = startIndex;
    array[offset + 1] = startIndex + 1;
    array[offset + 2] = startIndex + 2;
    array[offset + 3] = startIndex;
    array[offset + 4] = startIndex + 2;
    array[offset + 5] = startIndex + 3;
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
