import * as THREE from "three";
import Shape from "./Shape.js";
/**
 * A segment between two points.
 *
 * @example line.ts
 */
export default class Line extends Shape {
    constructor(start, end, config = {}) {
        config = { ...Line.defaultConfig(), ...config };
        super([start, end], config);
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: start
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: end
        });
        this.curveEndIndices = [[0, 1]];
    }
    static defaultConfig() {
        return { ...Shape.defaultConfig() };
    }
    static centeredLine(start, end, config = {}) {
        const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
        const line = new Line(new THREE.Vector3().subVectors(start, center), new THREE.Vector3().subVectors(end, center), config);
        line.position.copy(center);
        return line;
    }
    reshape(start, end, config = {}) {
        this.start.copy(start);
        this.end.copy(end);
        this.copyStrokeAndFill(new Line(start, end, config));
    }
    getClassConfig() {
        return {};
    }
    getAttributes() {
        return {
            start: this.start,
            end: this.end,
        };
    }
    getVector(global = false) {
        this.updateWorldMatrix(true, false);
        return global
            ? new THREE.Vector3().subVectors(new THREE.Vector3().copy(this.end).applyMatrix4(this.matrixWorld), new THREE.Vector3().copy(this.start).applyMatrix4(this.matrixWorld))
            : new THREE.Vector3().subVectors(this.end, this.start);
    }
    static fromAttributes(attributes) {
        const { start, end } = attributes;
        return new Line(start, end);
    }
}
//# sourceMappingURL=Line.js.map