import WebGPUMeshLine from "../geometry/WebGPUMeshLine/index.js";
import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";
export default class FadeIn extends Animation {
    constructor(object, config) {
        let family = true;
        if (config && config.family === false) {
            family = false;
        }
        super((elapsedTime, _deltaTime) => {
            if (family) {
                this.object.traverse((child) => {
                    const interpolatedOpacity = THREE.MathUtils.lerp(0, config?.preserveOpacity ? this.initialOpacity.get(child) : 1, elapsedTime);
                    if (child instanceof WebGPUMeshLine) {
                        child.material.uniforms.opacity.value = interpolatedOpacity;
                    }
                    else if (child instanceof THREE.Mesh) {
                        child.material.opacity = interpolatedOpacity;
                    }
                });
            }
            else {
                [this.object.stroke, this.object.fill].forEach((mesh) => {
                    if (!mesh)
                        return;
                    const interpolatedOpacity = THREE.MathUtils.lerp(0, config?.preserveOpacity ? this.initialOpacity.get(mesh) : 1, elapsedTime);
                    if (mesh instanceof WebGPUMeshLine) {
                        mesh.material.uniforms.opacity.value = interpolatedOpacity;
                    }
                    else if (mesh instanceof THREE.Mesh) {
                        mesh.material.opacity = interpolatedOpacity;
                    }
                });
            }
        }, { object, reveal: true, ...config });
        Object.defineProperty(this, "initialOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    setUp() {
        super.setUp();
        this.object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                this.initialOpacity.set(child, child.material.opacity);
            }
        });
    }
}
//# sourceMappingURL=FadeIn.js.map