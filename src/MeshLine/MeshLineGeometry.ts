import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import "./meshline.glsl.js";

export default class MeshLineGeometry extends BufferGeometry {
  readonly isMeshLineGeometry = true;
  override readonly type = "MeshLineGeometry";

  #position = new Float32Array();
  #endPosition = new Float32Array();
  #nextPosition = new Float32Array();
  #textureCoords = new Int32Array();
  #proportion = new Float32Array();
  #indices = new Uint16Array();

  #attributes: {
    position: Float32BufferAttribute;
    endPosition: Float32BufferAttribute;
    nextPosition: Float32BufferAttribute;
    textureCoords: Float32BufferAttribute;
    proportion: Float32BufferAttribute;
    index: Uint16BufferAttribute;
  } | null = null;

  points: Vector3[];

  #previousPointCount = 0;
  #pointCount = 0;

  setPoints(points: Array<Vector3>, updateBounds: boolean = true) {
    this.points = points;
    this.#pointCount = points.length;

    const pointCount = this.#pointCount;
    const sizeChanged = this.#previousPointCount !== pointCount;

    if (!this.#attributes || sizeChanged) {
      this.#makeNewBuffers(pointCount);
    }

    this.#previousPointCount = pointCount;

    let lengths = new Float32Array(this.points.length);
    lengths[0] = 0;
    for (let i = 0; i < this.points.length - 2; i++) {
      const position = points[i];
      const endPosition = points[i + 1];
      const nextPosition = points[i + 2];
      const previousLength = lengths[i];
      if (
        position === undefined ||
        endPosition === undefined ||
        nextPosition === undefined ||
        previousLength === undefined
      ) {
        throw new Error("point missing");
      }
      lengths[i + 1] =
        previousLength +
        ((position.x - endPosition.x) ** 2 +
          (position.y - endPosition.y) ** 2 +
          (position.z - endPosition.z) ** 2) **
          0.5;
      this.#addSegment(i, position, endPosition, nextPosition);
    }
    const firstPoint = points.at(0);
    const lastPoint = points.at(-1);
    if (firstPoint === undefined || lastPoint === undefined) {
      throw new Error("invalid endpoints");
    }

    let nextPosition: Vector3 | undefined;
    if (new Vector3().subVectors(firstPoint, lastPoint).length() < 0.001) {
      nextPosition = points.at(1);
    } else {
      nextPosition = points.at(-1);
    }

    const position = points.at(-2);
    const endPosition = points.at(-1);
    const previousLength = lengths.at(-2);
    if (
      position === undefined ||
      endPosition === undefined ||
      nextPosition === undefined ||
      previousLength === undefined
    ) {
      throw new Error("point missing");
    }
    lengths[this.points.length - 1] =
      previousLength +
      ((position.x - endPosition.x) ** 2 +
        (position.y - endPosition.y) ** 2 +
        (position.z - endPosition.z) ** 2) **
        0.5;
    this.#addSegment(points.length - 2, position, endPosition, nextPosition);

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
      this.#proportion[offset] = startProportion;
      this.#proportion[offset + 1] = startProportion;
      this.#proportion[offset + 2] = endProportion;
      this.#proportion[offset + 3] = endProportion;
    }

    if (!this.#attributes) throw new Error("missing attributes");
    this.#attributes.position.needsUpdate = true;
    this.#attributes.endPosition.needsUpdate = true;
    this.#attributes.nextPosition.needsUpdate = true;
    this.#attributes.textureCoords.needsUpdate = sizeChanged;
    this.#attributes.proportion.needsUpdate = true;
    this.#attributes.index.needsUpdate = sizeChanged;

    if (updateBounds) {
      this.computeBoundingSphere();
      this.computeBoundingBox();
    }
  }

  #addSegment(index: number, start: Vector3, end: Vector3, next: Vector3) {
    let x, y, z;

    const vertexOffset = 12 * index;
    ({ x, y, z } = start);
    this.setVertexData(this.#position, vertexOffset, x, y, z);

    ({ x, y, z } = end);
    this.setVertexData(this.#endPosition, vertexOffset, x, y, z);

    ({ x, y, z } = next);
    this.setVertexData(this.#nextPosition, vertexOffset, x, y, z);

    const textureOffset = 4 * index;
    this.setTextureCoords(this.#textureCoords, textureOffset);

    const indexOffset = 6 * index;
    const nextIndex = 4 * index;
    this.setIndices(this.#indices, indexOffset, nextIndex);
  }

  #makeNewBuffers(pointCount: number) {
    // Remove the previous buffers from the GPU
    this.dispose();

    const rectCount = pointCount - 1;
    this.#position = new Float32Array(12 * rectCount);
    this.#endPosition = new Float32Array(12 * rectCount);
    this.#nextPosition = new Float32Array(12 * rectCount);
    this.#textureCoords = new Int32Array(4 * rectCount);
    this.#proportion = new Float32Array(4 * rectCount);
    this.#indices = new Uint16Array(6 * rectCount);

    this.#attributes = {
      position: new BufferAttribute(this.#position, 3),
      endPosition: new BufferAttribute(this.#endPosition, 3),
      nextPosition: new BufferAttribute(this.#nextPosition, 3),
      textureCoords: new BufferAttribute(this.#textureCoords, 1),
      proportion: new BufferAttribute(this.#proportion, 1),
      index: new BufferAttribute(this.#indices, 1),
    };

    this.setAttribute("position", this.#attributes.position);
    this.setAttribute("endPosition", this.#attributes.endPosition);
    this.setAttribute("nextPosition", this.#attributes.nextPosition);
    this.setAttribute("textureCoords", this.#attributes.textureCoords);
    this.setAttribute("proportion", this.#attributes.proportion);
    this.setIndex(this.#attributes.index);
  }

  setVertexData(
    array: WritableArrayLike<number>,
    offset: number,
    x: number,
    y: number,
    z: number
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

  setTextureCoords(array: WritableArrayLike<number>, offset: number) {
    array[offset] = 1; // 2 * 0 + 1;
    // array[offset + 1] = 0; // 2 * 0 + 0;
    array[offset + 2] = 2; // 2 * 1 + 0;
    array[offset + 3] = 3; // 2 * 1 + 1;
  }

  setIndices(
    array: WritableArrayLike<number>,
    offset: number,
    startIndex: number
  ) {
    array[offset] = startIndex;
    array[offset + 1] = startIndex + 1;
    array[offset + 2] = startIndex + 2;
    array[offset + 3] = startIndex;
    array[offset + 4] = startIndex + 2;
    array[offset + 5] = startIndex + 3;
  }
}

interface WritableArrayLike<T> {
  readonly length: number;
  [n: number]: T;
}
