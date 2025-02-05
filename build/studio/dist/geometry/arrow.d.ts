import * as THREE from "three";
import Shape, { type Style } from "./Shape.js";
export type ArrowAttributes = {
    start: THREE.Vector3;
    end: THREE.Vector3;
};
/**
 * An arrow.
 *
 * @example arrow.ts
 */
export default class Arrow extends Shape {
    start: THREE.Vector3;
    end: THREE.Vector3;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
    getAttributes(): ArrowAttributes;
}
//# sourceMappingURL=Arrow.d.ts.map