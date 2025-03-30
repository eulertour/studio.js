import { Animation } from "./Animation.js";
export default class Shift extends Animation {
    constructor(object, offset, config) {
        super((_, deltaTime) => {
            object.position.add(offset.clone().multiplyScalar(deltaTime / this.duration));
        }, {
            object,
            reveal: true,
            ...config,
        });
        Object.defineProperty(this, "totalDeltaTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
}
//# sourceMappingURL=Shift.js.map