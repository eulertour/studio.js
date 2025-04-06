import * as THREE from "three/webgpu";

export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
  readonly isMeshLineGeometry = true;
  override readonly type = "MeshLineGeometry";

  #position = new Float32Array();
  #endPosition = new Float32Array();
  #nextPosition = new Float32Array();
  #previousPosition = new Float32Array();
  #textureCoords = new Float32Array();
  #beforeArrow = new Float32Array();
  #arrow = new Float32Array();
  #start = new Float32Array();
  #bottom = new Float32Array();
  #startProportion = new Float32Array();
  #endProportion = new Float32Array();
  #indices = new Uint16Array();

  #attributes: {
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
  } | null = null;

  points: THREE.Vector3[];
  totalLength: number;

  #previousPointCount = 0;
  #pointCount = 0;

  constructor(public arrow = false) {
    super();
  }

  setPoints(points: Array<THREE.Vector3>, updateBounds = true) {
    const arrowLength = 0.3;
    if (this.arrow) {
      // Find the index of the last point that is at least arrowLength away from the end.
      let arrowIndex = 0;
      for (let i = points.length - 2; i >= 0; i--) {
        const point = points[i];
        if (point.distanceTo(points[points.length - 1]) >= arrowLength) {
          arrowIndex = i;
          break;
        }
      }

      // Find the point that is arrowLength away from the end.
      const aVec = points[arrowIndex];
      const bVec = points[points.length - 1];
      const vVec = new THREE.Vector3().subVectors(points[arrowIndex + 1], aVec);
      const d = arrowLength;
      const a = vVec.dot(vVec);
      const b = 2 * (aVec.dot(vVec) - bVec.dot(vVec));
      const c = aVec.dot(aVec) - 2 * aVec.dot(bVec) + bVec.dot(bVec) - d * d;
      const rootDiscriminant = Math.sqrt(b * b - 4 * a * c);
      const t1 = (-b + rootDiscriminant) / (2 * a);
      const t2 = (-b - rootDiscriminant) / (2 * a);
      let t;
      if (0 <= t1 && t1 <= 1) {
        t = t1;
      } else if (0 <= t2 && t2 <= 1) {
        t = t2;
      } else {
        console.error(points);
        throw new Error("Error creating arrow from points: No valid solution");
      }
      points.splice(
        arrowIndex + 1,
        points.length - arrowIndex - 1,
        aVec.clone().add(vVec.clone().multiplyScalar(t)),
        points.at(-1),
      );
    }

    this.points = points;
    this.#pointCount = points.length;

    const pointCount = this.#pointCount;
    const sizeChanged = this.#previousPointCount !== pointCount;

    if (!this.#attributes || sizeChanged) {
      this.#makeNewBuffers(pointCount);
    }

    this.#previousPointCount = pointCount;

    const lengths = new Float32Array(this.points.length);
    lengths[0] = 0;

    const firstPoint = points.at(0);
    const lastPoint = points.at(-1);
    if (firstPoint === undefined || lastPoint === undefined) {
      throw new Error("invalid endpoints");
    }

    // Handle the case where the first and last points are the same.
    let previousPosition: THREE.Vector3 | undefined;
    if (
      new THREE.Vector3().subVectors(firstPoint, lastPoint).length() < 0.001
    ) {
      previousPosition = points.at(-1);
    } else {
      previousPosition = points.at(0);
    }

    let nextPosition: THREE.Vector3 | undefined;
    if (points.length < 3) {
      nextPosition = points[1];
    } else {
      nextPosition = points[2];
    }

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
    lengths[1] =
      previousLength +
      ((position.x - endPosition.x) ** 2 +
        (position.y - endPosition.y) ** 2 +
        (position.z - endPosition.z) ** 2) **
        0.5;
    this.#addSegment(0, previousPosition, position, endPosition, nextPosition);

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
      lengths[i + 1] =
        previousLength +
        ((position.x - endPosition.x) ** 2 +
          (position.y - endPosition.y) ** 2 +
          (position.z - endPosition.z) ** 2) **
          0.5;
      this.#addSegment(
        i,
        previousPosition,
        position,
        endPosition,
        nextPosition,
      );
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
    lengths[this.points.length - 1] =
      previousLength +
      ((position.x - endPosition.x) ** 2 +
        (position.y - endPosition.y) ** 2 +
        (position.z - endPosition.z) ** 2) **
        0.5;
    this.#addSegment(
      points.length - 2,
      previousPosition,
      position,
      endPosition,
      nextPosition,
    );

    if (this.arrow) {
      this.#textureCoords[4 * (points.length - 3)] = 9; // 8 * 1 + 2 * 0 + 1;
      this.#textureCoords[4 * (points.length - 3) + 1] = 8; // 8 * 1 + 2 * 0 + 0;
      this.#textureCoords[4 * (points.length - 3) + 2] = 10; // 8 * 1 + 2 * 1 + 0;
      this.#textureCoords[4 * (points.length - 3) + 3] = 11; // 8 * 1 + 2 * 1 + 1;

      this.#textureCoords[4 * (points.length - 2)] = 5; // 4 * 1 + 2 * 0 + 1;
      this.#textureCoords[4 * (points.length - 2) + 1] = 4; // 4 * 1 + 2 * 0 + 0;
      this.#textureCoords[4 * (points.length - 2) + 2] = 6; // 4 * 1 + 2 * 1 + 0;
      this.#textureCoords[4 * (points.length - 2) + 3] = 7; // 4 * 1 + 2 * 1 + 1;
    }

    this.totalLength = lengths.at(-1);
    if (this.totalLength === undefined) {
      throw new Error("Invalid length");
    }
    for (let i = 0; i < this.points.length - 1; i++) {
      const startLength = lengths[i];
      const endLength = lengths[i + 1];
      if (startLength === undefined || endLength === undefined) {
        throw new Error("Invalid length");
      }
      const startProportion = startLength / this.totalLength;
      const endProportion = endLength / this.totalLength;
      const offset = 4 * i;
      this.#startProportion[offset] = startProportion;
      this.#startProportion[offset + 1] = startProportion;
      this.#startProportion[offset + 2] = startProportion;
      this.#startProportion[offset + 3] = startProportion;
      this.#endProportion[offset] = endProportion;
      this.#endProportion[offset + 1] = endProportion;
      this.#endProportion[offset + 2] = endProportion;
      this.#endProportion[offset + 3] = endProportion;
    }

    if (!this.#attributes) throw new Error("missing attributes");
    this.#attributes.position.needsUpdate = true;
    this.#attributes.endPosition.needsUpdate = true;
    this.#attributes.nextPosition.needsUpdate = true;
    this.#attributes.previousPosition.needsUpdate = true;
    this.#attributes.textureCoords.needsUpdate = sizeChanged;
    this.#attributes.startProportion.needsUpdate = true;
    this.#attributes.endProportion.needsUpdate = true;
    this.#attributes.index.needsUpdate = sizeChanged;

    if (updateBounds) {
      this.computeBoundingSphere();
      this.computeBoundingBox();
    }
  }

  #addSegment(
    index: number,
    previous: THREE.Vector3,
    start: THREE.Vector3,
    end: THREE.Vector3,
    next: THREE.Vector3,
  ) {
    const vertexOffset = 12 * index;
    let x: number;
    let y: number;
    let z: number;

    ({ x, y, z } = previous);
    this.setVertexData(this.#previousPosition, vertexOffset, x, y, z);

    ({ x, y, z } = start);
    this.setVertexData(this.#position, vertexOffset, x, y, z);

    ({ x, y, z } = end);
    this.setVertexData(this.#endPosition, vertexOffset, x, y, z);

    ({ x, y, z } = next);
    this.setVertexData(this.#nextPosition, vertexOffset, x, y, z);

    const textureOffset = 4 * index;
    this.setTextureCoords(this.#textureCoords, textureOffset);
    this.setStart(this.#start, textureOffset);
    this.setBottom(this.#bottom, textureOffset);

    const indexOffset = 6 * index;
    const nextIndex = 4 * index;
    this.setIndices(this.#indices, indexOffset, nextIndex);
  }

  #makeNewBuffers(pointCount: number) {
    // Remove the previous buffers from the GPU
    this.dispose();

    const rectCount = pointCount - 1;
    this.#previousPosition = new Float32Array(12 * rectCount);
    this.#position = new Float32Array(12 * rectCount);
    this.#endPosition = new Float32Array(12 * rectCount);
    this.#nextPosition = new Float32Array(12 * rectCount);
    this.#textureCoords = new Float32Array(4 * rectCount);
    this.#beforeArrow = new Float32Array(4 * rectCount);
    this.#arrow = new Float32Array(4 * rectCount);
    this.#start = new Float32Array(4 * rectCount);
    this.#bottom = new Float32Array(4 * rectCount);
    this.#startProportion = new Float32Array(4 * rectCount);
    this.#endProportion = new Float32Array(4 * rectCount);
    this.#indices = new Uint16Array(6 * rectCount);

    this.#attributes = {
      previousPosition: new THREE.BufferAttribute(this.#previousPosition, 3),
      position: new THREE.BufferAttribute(this.#position, 3),
      endPosition: new THREE.BufferAttribute(this.#endPosition, 3),
      nextPosition: new THREE.BufferAttribute(this.#nextPosition, 3),
      textureCoords: new THREE.BufferAttribute(this.#textureCoords, 1),
      beforeArrow: new THREE.BufferAttribute(this.#beforeArrow, 1),
      arrow: new THREE.BufferAttribute(this.#arrow, 1),
      start: new THREE.BufferAttribute(this.#start, 1),
      bottom: new THREE.BufferAttribute(this.#bottom, 1),
      startProportion: new THREE.BufferAttribute(this.#startProportion, 1),
      endProportion: new THREE.BufferAttribute(this.#endProportion, 1),
      index: new THREE.BufferAttribute(this.#indices, 1),
    };

    this.setAttribute("position", this.#attributes.position);
    this.setAttribute("endPosition", this.#attributes.endPosition);
    this.setAttribute("nextPosition", this.#attributes.nextPosition);
    this.setAttribute("previousPosition", this.#attributes.previousPosition);
    this.setAttribute("textureCoords", this.#attributes.textureCoords);
    this.setAttribute("beforeArrow", this.#attributes.beforeArrow);
    this.setAttribute("arrow", this.#attributes.arrow);
    this.setAttribute("start", this.#attributes.start);
    this.setAttribute("bottom", this.#attributes.bottom);
    this.setAttribute("startProportion", this.#attributes.startProportion);
    this.setAttribute("endProportion", this.#attributes.endProportion);
    this.setIndex(this.#attributes.index);
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
