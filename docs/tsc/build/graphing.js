import * as THREE from 'three';
import { Polyline } from './geometry';
/**
 * A curve described by an equation.
 */
export class Curve extends Polyline {
    constructor(equation, config = {}) {
        config = Object.assign(Object.assign({}, Polyline.defaultConfig()), config);
        super([new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)], config);
        this.equation = equation;
    }
    static defaultConfig() {
        return Object.assign({}, Polyline.defaultConfig());
    }
    getClassConfig() {
        return {};
    }
}
