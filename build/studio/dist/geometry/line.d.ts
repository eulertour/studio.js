import * as THREE from "three";
import Shape, { type Style } from "./shape.js";
export type LineAttributes = {
    start: THREE.Vector3;
    end: THREE.Vector3;
};
/**
 * A segment between two points.
 *
 * @example line.ts
 */
export default class Line extends Shape {
    start: THREE.Vector3;
    end: THREE.Vector3;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
        arrow?: boolean;
    });
    static defaultConfig(): {
        arrow: boolean;
    };
    static centeredLine(start: THREE.Vector3, end: THREE.Vector3, config?: Style): Line;
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
        arrow?: boolean;
    }): void;
    getClassConfig(): {};
    getAttributes(): LineAttributes;
    getVector(global?: boolean): THREE.Vector3;
    static fromAttributes(attributes: LineAttributes): Line;
}
//# sourceMappingURL=line.d.ts.map