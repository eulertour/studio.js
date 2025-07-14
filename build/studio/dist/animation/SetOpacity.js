import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";
export default class SetOpacity extends Animation {
    constructor(objectOrFunc, targetOpacity, config) {
        let family = true;
        if (config && config.family === false) {
            family = false;
        }
        super((elapsedTime, _deltaTime) => {
            if (family) {
                this.object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        if (!this.initialOpacity.has(child)) {
                            console.error("Unknown child");
                        }
                        child.material.opacity = THREE.MathUtils.lerp(this.initialOpacity.get(child), this.targetOpacity, elapsedTime);
                    }
                });
            }
            else {
                [this.object.stroke, this.object.fill].forEach((mesh) => {
                    if (!mesh)
                        return;
                    mesh.material.opacity = THREE.MathUtils.lerp(this.initialOpacity.get(mesh), this.targetOpacity, elapsedTime);
                });
            }
        }, { object: objectOrFunc, ...config });
        Object.defineProperty(this, "targetOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: targetOpacity
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
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
//# sourceMappingURL=SetOpacity.js.map