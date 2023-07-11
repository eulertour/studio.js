import * as THREE from "three";
import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import { GeometryResolution } from "../geometry";
import "./meshline.glsl.js";

class MeshLineGeometry extends BufferGeometry {
  constructor(points: Array<THREE.Vector3>) {
    super();

    const vertexCount = 4 * (points.length - 1);
    let position = new Float32Array(12 * vertexCount);
    let endPosition = new Float32Array(12 * vertexCount);
    let nextPosition = new Float32Array(12 * vertexCount);
    let textureCoords = new Int32Array(4 * vertexCount);
    let indices = new Uint16Array(6 * vertexCount);

    const addSegment = (
      index: number,
      start: THREE.Vector3,
      end: THREE.Vector3,
      next: THREE.Vector3
    ) => {
      let x, y, z;

      const vertexOffset = 12 * index;
      ({ x, y, z } = start);
      this.setVertexData(position, vertexOffset, x, y, z);

      ({ x, y, z } = end);
      this.setVertexData(endPosition, vertexOffset, x, y, z);

      ({ x, y, z } = next);
      this.setVertexData(nextPosition, vertexOffset, x, y, z);

      const textureOffset = 4 * index;
      this.setTextureCoords(textureCoords, textureOffset);

      const indexOffset = 6 * index;
      const nextIndex = 4 * index;
      this.setIndices(indices, indexOffset, nextIndex);
    };

    for (let i = 0; i < points.length - 2; i++) {
      addSegment(i, points[i], points[i + 1], points[i + 2]);
    }
    addSegment(points.length - 2, points.at(-2), points.at(-1), points.at(-1));

    this.setAttribute("position", new BufferAttribute(position, 3));
    this.setAttribute("endPosition", new BufferAttribute(endPosition, 3));
    this.setAttribute("nextPosition", new BufferAttribute(nextPosition, 3));
    this.setAttribute("textureCoords", new BufferAttribute(textureCoords, 1));
    this.setIndex(new BufferAttribute(indices, 1));
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

class MeshLineMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: Object.assign({}, THREE.UniformsLib.fog, {
        color: { value: new THREE.Vector3(0.0, 0.0, 1.0) },
        opacity: { value: 1 },
        resolution: { value: GeometryResolution },
        unitsPerPixel: { value: 8 / GeometryResolution.y },
        pixelWidth: { value: 35 * window.devicePixelRatio },
      }),
      vertexShader: THREE.ShaderChunk.eulertour_meshline_vert,
      fragmentShader: THREE.ShaderChunk.eulertour_meshline_frag,
      transparent: true,
      opacity: 0.5,
    });

    Object.defineProperties(this, {
      fogColor: {
        enumerable: true,
        get: () => {
          return this.uniforms.opacity.value;
        },
        set: (value) => {
          this.uniforms.opacity.value = value;
        },
      },
    });
  }
}

export { MeshLineGeometry, MeshLineMaterial };
