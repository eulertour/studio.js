import * as THREE from "three/webgpu";
import Shape from "./Shape.js";
import { type Style } from "./utils.js";
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