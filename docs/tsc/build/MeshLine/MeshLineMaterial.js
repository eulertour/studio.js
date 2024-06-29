import * as THREE from "three";
import { MESHLINE_FRAG, MESHLINE_VERT } from "./meshline.glsl";
export const CameraDimensions = new THREE.Vector2();
export const setCameraDimensions = (camera) => {
    const { left, right, top, bottom } = camera;
    CameraDimensions.set(right - left, top - bottom);
};
export const CanvasViewport = new THREE.Vector4();
export const setCanvasViewport = (viewport) => {
    CanvasViewport.copy(viewport);
    if (typeof window !== "undefined") {
        CanvasViewport.multiplyScalar(window.devicePixelRatio);
    }
};
export default class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters) {
        super({
            uniforms: Object.assign({}, THREE.UniformsLib.fog, {
                color: { value: new THREE.Color() },
                opacity: { value: 1 },
                viewport: { value: CanvasViewport },
                dimensions: { value: CameraDimensions },
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
        return this.uniforms.unitWidth.value * 4 * 10;
    }
    set width(value) {
        this.uniforms.unitWidth.value = value / 4 / 10;
    }
}
//# sourceMappingURL=MeshLineMaterial.js.map