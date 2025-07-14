import { Animation } from "./Animation.js";
export default class Erase extends Animation {
    constructor(object, config) {
        super((elapsedTime) => {
            object.stroke.material.uniforms.drawRange.value.y = 1 - elapsedTime;
        }, { object, hide: true, ...config });
        Object.defineProperty(this, "object", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: object
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
    }
    tearDown() {
        if (this.config?.remove) {
            this.object.parent.remove(this.object);
        }
        if (this.config?.restore) {
            this.object.stroke.material.uniforms.drawRange.value.y = 1;
        }
        super.tearDown();
    }
}
//# sourceMappingURL=Erase.js.map