import { Animation } from "./Animation.js";
import * as THREE from "three";
export default class SetScale extends Animation {
    constructor(object, factor, config) {
        super((elapsedTime) => {
            const scale = THREE.MathUtils.lerp(this.initialScale, factor, elapsedTime);
            object.scale.set(scale, scale);
        }, { object, reveal: true, ...config });
        Object.defineProperty(this, "initialScale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    setUp() {
        super.setUp();
        this.initialScale = this.object.scale.x;
    }
}
//# sourceMappingURL=SetScale.js.map