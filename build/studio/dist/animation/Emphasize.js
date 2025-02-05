import { Animation } from "./Animation.js";
export default class Emphasize extends Animation {
    constructor(object, largeScale = 1.1, config) {
        super((elapsedTime) => {
            let scale;
            if (elapsedTime <= this.keyframe) {
                const t0 = elapsedTime / this.keyframe;
                scale = (1 - t0) * this.initialScale + t0 * this.largeScale;
            }
            else {
                const t0 = (elapsedTime - this.keyframe) / (1 - this.keyframe);
                scale = (1 - t0) * this.largeScale + t0 * this.initialScale;
            }
            this.object.scale.setScalar(scale);
        }, { object, reveal: true, ...config });
        Object.defineProperty(this, "initialScale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "largeScale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "keyframe", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.9
        });
        this.largeScale = largeScale;
    }
    setUp() {
        super.setUp();
        this.initialScale = this.object.scale.x;
    }
}
//# sourceMappingURL=Emphasize.js.map