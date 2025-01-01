import THREE from "../three.js";
import { MESHLINE_FRAG, MESHLINE_VERT } from "./meshline.glsl.js";

export const CameraDimensions = new THREE.Vector2();
export const setCameraDimensions = (camera: THREE.OrthographicCamera) => {
  const { left, right, top, bottom } = camera;
  CameraDimensions.set(right - left, top - bottom);
};

export const CanvasViewport = new THREE.Vector4();
export const setCanvasViewport = (viewport: THREE.Vector4) => {
  CanvasViewport.copy(viewport);

  if (typeof window !== "undefined") {
    CanvasViewport.multiplyScalar(window.devicePixelRatio);
  }
};

export default class MeshLineMaterial extends THREE.ShaderMaterial {
  constructor(
    parameters: THREE.ShaderMaterialParameters & {
      color: THREE.ColorRepresentation;
      opacity: number;
      width: number;
      dashLength: number;
      dashOffset: number;
    },
  ) {
    super({
      uniforms: Object.assign({}, THREE.UniformsLib.fog, {
        color: { value: new THREE.Color() },
        opacity: { value: 1 },
        viewport: { value: CanvasViewport },
        dimensions: { value: CameraDimensions },
        unitWidth: { value: 1 / 10 },
        drawRange: { value: new THREE.Vector2(0, 1) },
        dashLength: { value: 0 },
        totalLength: { value: 0 },
        dashOffset: { value: 0 },
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
    return this.uniforms.unitWidth.value * 32.5;
  }

  set width(value) {
    this.uniforms.unitWidth.value = value / 32.5;
  }

  get totalLength() {
    return this.uniforms.totalLength.value;
  }

  set totalLength(value) {
    this.uniforms.totalLength.value = value;
  }

  get dashLength() {
    return this.uniforms.dashLength.value;
  }

  set dashLength(value) {
    this.uniforms.dashLength.value = value;
  }

  get dashOffset() {
    return this.uniforms.dashOffset.value;
  }

  set dashOffset(value) {
    this.uniforms.dashOffset.value = value;
  }
}
