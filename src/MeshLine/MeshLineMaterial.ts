import * as THREE from "three";
import { GeometryResolution } from "../geometry";
import type { ShaderMaterialParameters } from "three";

const devicePixelRatio =
  typeof window !== "undefined" ? window.devicePixelRatio : 1;

export default class MeshLineMaterial extends THREE.ShaderMaterial {
  constructor(
    parameters: ShaderMaterialParameters & {
      color: THREE.Color;
      opacity: number;
      width: number;
    }
  ) {
    super({
      uniforms: Object.assign({}, THREE.UniformsLib.fog, {
        color: { value: new THREE.Color(0x0000ff) },
        opacity: { value: 1 },
        resolution: { value: GeometryResolution },
        unitsPerPixel: { value: 8 / GeometryResolution.y },
        pixelWidth: { value: 4 * devicePixelRatio },
        drawRange: { value: new THREE.Vector2(0, 1) },
      }),
      vertexShader: THREE.ShaderChunk.eulertour_meshline_vert,
      fragmentShader: THREE.ShaderChunk.eulertour_meshline_frag,
      transparent: true,
    });

    Object.defineProperties(this, {
      opacity: {
        enumerable: true,
        get: () => {
          return this.uniforms.opacity.value;
        },
        set: (value) => {
          this.uniforms.opacity.value = value;
        },
      },
      width: {
        enumerable: true,
        get: () => {
          return this.uniforms.pixelWidth.value * devicePixelRatio;
        },
        set: (value) => {
          this.uniforms.pixelWidth.value = value * devicePixelRatio;
        },
      },
      color: {
        enumerable: true,
        get: () => {
          return this.uniforms.color.value;
        },
        set: (value) => {
          this.uniforms.color.value = value;
        },
      },
      drawRange: {
        enumerable: true,
        get: () => {
          return this.uniforms.drawRange.value;
        },
        set: (value) => {
          this.uniforms.drawRange.value = value;
        },
      },
    });

    this.setValues(parameters);
  }
}