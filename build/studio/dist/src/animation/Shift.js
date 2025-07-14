import { Animation } from "./Animation.js";
export default class Shift extends Animation {
    constructor(object, offset, config) {
        super((_elapsedTime, deltaTime) => {
            object.position.add(offset.clone().multiplyScalar(deltaTime));
        }, {
            object,
            reveal: true,
            ...config,
        });
    }
}
//# sourceMappingURL=Shift.js.map