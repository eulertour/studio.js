import { Animation } from "./Animation.js";
export default class Rotate extends Animation {
    constructor(object, angle, config) {
        super((_elapsedTime, deltaTime) => {
            object.rotation.z += angle * deltaTime;
        }, { object, reveal: true, ...config });
    }
}
//# sourceMappingURL=Rotate.js.map