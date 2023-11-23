import * as THREE from "three";
import { GeometryResolution } from "../geometry";
import type { ShaderMaterialParameters } from "three";
import { MESHLINE_FRAG, MESHLINE_VERT } from "./meshline.glsl";

const devicePixelRatio =
  typeof window !== "undefined" ? window.devicePixelRatio : 1;

export default class MeshLineMaterial extends THREE.ShaderMaterial {
  constructor(
    parameters: ShaderMaterialParameters & {
      color: THREE.ColorRepresentation;
      opacity: number;
      width: number;
    }
  ) {
    super({
      uniforms: Object.assign({}, THREE.UniformsLib.fog, {
        color: { value: new THREE.Color(0x0000ff) },
        opacity: { value: 1 },
        resolution: { value: GeometryResolution },
        pixelsPerUnit: { value: GeometryResolution.y / 8 },
        unitWidth: { value: 1 / 10 },
        drawRange: { value: new THREE.Vector2(0, 1) },
      }),
      vertexShader: MESHLINE_VERT,
      fragmentShader: MESHLINE_FRAG,
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
          return this.uniforms.unitWidth.value * 8 * 10;
        },
        set: (value) => {
          this.uniforms.unitWidth.value = value / 8 / 10;
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

    parameters.color = new THREE.Color()
      .set(parameters.color)
      .convertLinearToSRGB();
    this.setValues(parameters);
  }
}
