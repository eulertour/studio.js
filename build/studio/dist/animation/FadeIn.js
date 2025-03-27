import { Animation } from "./Animation.js";
import * as THREE from "three";
export default class FadeIn extends Animation {
    constructor(object, config = {}) {
        // Default preserveOpacity to true unless explicitly set to false
        const preserveOpacity = config.preserveOpacity !== false;
        // Extract target opacities if provided
        const targetFillOpacity = config.targetOpacity?.fillOpacity;
        const targetStrokeOpacity = config.targetOpacity?.strokeOpacity;
        // Default family to true unless explicitly set to false
        const family = config.family !== false;
        super((elapsedTime, _deltaTime) => {
            // Special handling for objects with restyle method (Text or Shape)
            if (typeof object.restyle === 'function') {
                // Get target fill opacity
                const targetFill = targetFillOpacity !== undefined ? targetFillOpacity :
                    (preserveOpacity ? this.initialOpacity.get(object)?.fillOpacity || 1 : 1);
                // For Text objects (no strokeOpacity)
                if (object.constructor.name === 'Text') {
                    object.restyle({
                        fillOpacity: THREE.MathUtils.lerp(0, targetFill, elapsedTime)
                    });
                }
                // For Shape objects (has strokeOpacity)
                else {
                    // Get target stroke opacity
                    const targetStroke = targetStrokeOpacity !== undefined ? targetStrokeOpacity :
                        (preserveOpacity ? this.initialOpacity.get(object)?.strokeOpacity || 1 : 1);
                    object.restyle({
                        fillOpacity: THREE.MathUtils.lerp(0, targetFill, elapsedTime),
                        strokeOpacity: THREE.MathUtils.lerp(0, targetStroke, elapsedTime)
                    });
                }
            }
            // Standard THREE.js object handling (original code with preserveOpacity logic updated)
            else if (family) {
                this.object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const targetOpacity = targetFillOpacity !== undefined ? targetFillOpacity :
                            (preserveOpacity ? this.initialOpacity.get(child) : 1);
                        child.material.opacity = THREE.MathUtils.lerp(0, targetOpacity, elapsedTime);
                    }
                });
            }
            else {
                [this.object.stroke, this.object.fill].forEach((mesh) => {
                    if (!mesh)
                        return;
                    const targetOpacity = targetFillOpacity !== undefined ? targetFillOpacity :
                        (preserveOpacity ? this.initialOpacity.get(mesh) : 1);
                    mesh.material.opacity = THREE.MathUtils.lerp(0, targetOpacity, elapsedTime);
                });
            }
        }, { object, reveal: true, ...config });
        Object.defineProperty(this, "initialOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "preserveOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "targetFillOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "targetStrokeOpacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.preserveOpacity = preserveOpacity;
        this.targetFillOpacity = targetFillOpacity;
        this.targetStrokeOpacity = targetStrokeOpacity;
    }
    setUp() {
        super.setUp();
        // Handle objects with restyle method
        if (typeof this.object.restyle === 'function') {
            const opacities = {};
            // Extract current opacities
            this.object.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    if (!opacities.fillOpacity && child.material.opacity !== undefined) {
                        opacities.fillOpacity = child.material.opacity;
                    }
                }
            });
            // For shapes, try to find stroke opacity
            if (this.object.constructor.name !== 'Text') {
                // Placeholder - customize based on your implementation
                if (this.object.strokeOpacity !== undefined) {
                    opacities.strokeOpacity = this.object.strokeOpacity;
                }
                else if (this.object.style && this.object.style.strokeOpacity !== undefined) {
                    opacities.strokeOpacity = this.object.style.strokeOpacity;
                }
            }
            // Store opacities and initialize
            this.initialOpacity.set(this.object, opacities);
            // Set initial opacity to 0
            if (this.object.constructor.name === 'Text') {
                this.object.restyle({ fillOpacity: 0 });
            }
            else {
                this.object.restyle({
                    fillOpacity: 0,
                    strokeOpacity: 0
                });
            }
        }
        // Original code for standard THREE.js objects
        else {
            this.object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    this.initialOpacity.set(child, child.material.opacity);
                }
            });
        }
    }
}
/*

Example 1: Basic usage - preserving original opacity
new Animation.FadeIn(triangle)


Example2: Fade in everything to 100% opacity, ignoring original opacity
new Animation.FadeIn(triangle, { preserveOpacity: false })


Example 3: Set specific target opacities
new Animation.FadeIn(triangle, {
    targetOpacity: {
      fillOpacity: 0.5,
      strokeOpacity: 0.8
    }
  })

*/ 
//# sourceMappingURL=FadeIn.js.map