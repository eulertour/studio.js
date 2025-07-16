import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";
export default class Stagger extends Animation {
    /**
     * Creates a staggered fade-in animation for multiple objects
     * @param objects Array of objects to animate in sequence
     * @param config Additional configuration options
     */
    constructor(objects, config = {}) {
        const { duration = 2 / (objects.length + 1) } = config;
        const staggerDelay = (1 - duration) / (objects.length - 1);
        super((elapsedTime, _deltaTime) => {
            objects.forEach((object, index) => {
                const startTime = index * staggerDelay;
                const objectProgress = THREE.MathUtils.clamp((elapsedTime - startTime) / duration, 0, 1);
                // Only process if animation has started for this object
                if (objectProgress > 0) {
                    object.traverse((child) => {
                        if (child instanceof THREE.Mesh && child.material) {
                            const initialOpacity = config?.preserveOpacity
                                ? this.initialOpacities.get(child) || 1
                                : 1;
                            child.material.opacity = THREE.MathUtils.lerp(0, initialOpacity, objectProgress);
                        }
                    });
                }
            });
        }, { objects, reveal: true, ...config });
        Object.defineProperty(this, "objects", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "initialOpacities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "duration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "staggerDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.objects = objects;
        this.duration = duration;
        this.staggerDelay = staggerDelay;
    }
    setUp() {
        super.setUp();
        // Store initial opacity values for all objects
        this.objects.forEach((object) => {
            object.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    this.initialOpacities.set(child, child.material.opacity);
                    // Start with opacity 0
                    child.material.opacity = 0;
                }
            });
        });
    }
}
//# sourceMappingURL=StaggerFadeIn.js.map