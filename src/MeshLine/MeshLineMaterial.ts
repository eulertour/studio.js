import * as THREE from "three";
import { CanvasViewport } from "../geometry";
import type { ShaderMaterialParameters } from "three";
import { MESHLINE_FRAG, MESHLINE_VERT } from "./meshline.glsl";

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
        color: { value: new THREE.Color() },
        opacity: { value: 1 },
        viewport: { value: CanvasViewport },
        // pixelsPerUnit: { value: CanvasViewport.w / 8 },
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

  get color() {
    return this.uniforms.color.value;
  }

  set color(value) {
    this.uniforms.color.value = value;
  }

  get width() {
    return this.uniforms.unitWidth.value * 8 * 10;
  }

  set width(value) {
    this.uniforms.unitWidth.value = value / 8 / 10;
  }
}
