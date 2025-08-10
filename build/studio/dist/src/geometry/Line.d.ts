import * as THREE from "three/webgpu";
import Shape from "./Shape.js";
import { type Style } from "./utils.js";
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
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
    static defaultConfig(): {
        fill: boolean;
    };
    static centeredLine(start: THREE.Vector3, end: THREE.Vector3, config?: Style): Line;
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
    length(): number;
    getClassConfig(): {};
    getAttributes(): LineAttributes;
    getVector(global?: boolean): THREE.Vector3;
    static fromAttributes(attributes: LineAttributes): Line;
}
//# sourceMappingURL=Line.d.ts.map