import { Animation } from "./Animation.js";
export default class Grow extends Animation {
    constructor(object) {
        super((elapsedTime) => {
            object.scale.set(elapsedTime, elapsedTime, elapsedTime);
        }, { object, reveal: true });
    }
}
//# sourceMappingURL=Grow.js.map