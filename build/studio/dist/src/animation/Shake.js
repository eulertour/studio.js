import { Animation } from "./Animation.js";
export default class Shake extends Animation {
    constructor(object, config = {}) {
        const { maxRotation = 0.05, frequency = 4 } = config;
        super((_elapsedTime) => {
            const sine = maxRotation * Math.sin(frequency * Math.PI * _elapsedTime);
            object.rotation.z = sine;
        }, { object, reveal: true, ...config });
    }
}
//# sourceMappingURL=Shake.js.map