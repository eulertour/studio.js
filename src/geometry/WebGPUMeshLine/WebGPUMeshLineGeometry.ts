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
  startLength: THREE.Float32BufferAttribute;
  endLength: THREE.Float32BufferAttribute;
  index: THREE.Uint16BufferAttribute;
}

export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
  points: THREE.Vector3[];
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

    const lengths = new Array(points.length);
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
    this.addSegment(0, points, lengths);

    for (let i = 1; i < points.length - 2; i++) {
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
      this.addSegment(i, points, lengths);
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
    if (previousLength === undefined) {
      throw new Error("point missing");
    }
    this.addSegment(points.length - 2, points, lengths);

    const totalLength = lengths.at(-1);
    if (totalLength === undefined) {
      throw new Error("Invalid length");
    }
    for (let i = 0; i < points.length - 1; i++) {
      const startLength = lengths[i];
      const endLength = lengths[i + 1];
      if (startLength === undefined || endLength === undefined) {
        throw new Error("Invalid length");
      }
      const offset = 4 * i;
      this.startLength[offset] = startLength;
      this.startLength[offset + 1] = startLength;
      this.startLength[offset + 2] = startLength;
      this.startLength[offset + 3] = startLength;
      this.endLength[offset] = endLength;
      this.endLength[offset + 1] = endLength;
      this.endLength[offset + 2] = endLength;
      this.endLength[offset + 3] = endLength;
    }

    if (!this.attributes) throw new Error("missing attributes");
    this.attributes.position.needsUpdate = true;
    this.attributes.endPosition.needsUpdate = true;
    this.attributes.nextPosition.needsUpdate = true;
    this.attributes.previousPosition.needsUpdate = true;
    this.attributes.textureCoords.needsUpdate = sizeChanged;
    this.attributes.startLength.needsUpdate = true;
    this.attributes.endLength.needsUpdate = true;
    this.attributes.index.needsUpdate = sizeChanged;

    if (updateBounds) {
      this.computeBoundingSphere();
      this.computeBoundingBox();
    }
  }

  addSegment(
    segmentIndex: number,
    points: THREE.Vector3[],
    lengths: number[],
  ) {
    let previousPosition: THREE.Vector3;
    if (segmentIndex === 0) {
      previousPosition = indexOrThrow(points, 0);
    } else if (1 <= segmentIndex && segmentIndex < points.length - 2) {
      previousPosition = indexOrThrow(points, segmentIndex - 1);
    } else {
      if (points.length < 3) {
        previousPosition = indexOrThrow(points, points.length - 2);
      } else {
        previousPosition = indexOrThrow(points, points.length - 3);
      }
    }

    let startPosition: THREE.Vector3;
    if (segmentIndex === 0) {
      startPosition = indexOrThrow(points, 0);
    } else if (1 <= segmentIndex && segmentIndex < points.length - 2) {
      startPosition = indexOrThrow(points, segmentIndex);
    } else {
      startPosition = indexOrThrow(points, points.length - 2);
    }

    let endPosition: THREE.Vector3;
    if (segmentIndex === 0) {
      endPosition = indexOrThrow(points, 1);
    } else if (1 <= segmentIndex && segmentIndex < points.length - 2) {
      endPosition = indexOrThrow(points, segmentIndex + 1);
    } else {
      endPosition = indexOrThrow(points, points.length - 1);
    }

    let nextPosition: THREE.Vector3;
    if (segmentIndex === 0) {
      nextPosition = indexOrThrow(points, points.length < 3 ? 1 : 2);
    } else if (1 <= segmentIndex && segmentIndex < points.length - 2) {
      nextPosition = indexOrThrow(points, segmentIndex + 1);
    } else {
      const strokeIsClosed =
        new THREE.Vector3()
          .subVectors(
            indexOrThrow(points, 0),
            indexOrThrow(points, points.length - 1),
          )
          .length() < ERROR_THRESHOLD;
      nextPosition = indexOrThrow(
        points,
        strokeIsClosed ? 1 : points.length - 1,
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

    const offset = 4 * segmentIndex;
    this.setTextureCoords(this.textureCoords, offset);
    this.setStart(this.start, offset);
    this.setBottom(this.bottom, offset);

    lengths[segmentIndex + 1] =
      indexOrThrow(lengths, segmentIndex) +
      ((startPosition.x - endPosition.x) ** 2 +
        (startPosition.y - endPosition.y) ** 2 +
        (startPosition.z - endPosition.z) ** 2) **
        0.5;

    const startLength = indexOrThrow(lengths, segmentIndex);
    const endLength = indexOrThrow(lengths, segmentIndex + 1);

    this.startLength[offset] = startLength;
    this.startLength[offset + 1] = startLength;
    this.startLength[offset + 2] = startLength;
    this.startLength[offset + 3] = startLength;
    this.endLength[offset] = endLength;
    this.endLength[offset + 1] = endLength;
    this.endLength[offset + 2] = endLength;
    this.endLength[offset + 3] = endLength;

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
    this.startLength = new Float32Array(4 * numberOfSegments);
    this.endLength = new Float32Array(4 * numberOfSegments);
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
      startLength: new THREE.BufferAttribute(this.startLength, 1),
      endLength: new THREE.BufferAttribute(this.endLength, 1),
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
    this.setAttribute("startLength", attributes.startLength);
    this.setAttribute("endLength", attributes.endLength);
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
