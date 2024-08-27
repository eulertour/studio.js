import * as THREE from "three";
import { Polyline } from "./geometry";
/**
 * A curve described by an equation.
 */
export class Curve extends Polyline {
    equation;
    constructor(equation, config = {}) {
        config = { ...Polyline.defaultConfig(), ...config };
        super([new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)], config);
        this.equation = equation;
    }
    static defaultConfig() {
        return { ...super.defaultConfig() };
    }
    getClassConfig() {
        return {};
    }
}
//# sourceMappingURL=graphing.js.map