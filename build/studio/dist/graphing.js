import * as THREE from "three";
import Polyline from "./polyline.js";
/**
 * A curve described by an equation.
 */
export class Curve extends Polyline {
    constructor(equation, config = {}) {
        config = { ...Polyline.defaultConfig(), ...config };
        super([new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)], config);
        Object.defineProperty(this, "equation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: equation
        });
    }
    static defaultConfig() {
        return { ...Polyline.defaultConfig() };
    }
    getClassConfig() {
        return {};
    }
}
//# sourceMappingURL=graphing.js.map