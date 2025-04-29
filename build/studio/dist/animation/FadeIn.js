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
                    if (child instanceof THREE.Mesh) {
                        child.material.opacity = THREE.MathUtils.lerp(0, config?.preserveOpacity ? this.initialOpacity.get(child) : 1, elapsedTime);
                    }
                });
            }
            else {
                [this.object.stroke, this.object.fill].forEach((mesh) => {
                    if (!mesh)
                        return;
                    mesh.material.opacity = THREE.MathUtils.lerp(0, config?.preserveOpacity ? this.initialOpacity.get(mesh) : 1, elapsedTime);
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