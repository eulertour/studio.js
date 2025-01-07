import * as THREE from "three";
import { type Style } from "./shape.js";
import Line from "./line.js";
/**
 * An arrow derived from a line.
 *
 * @example arrow.ts
 */
export default class Arrow extends Line {
    start: THREE.Vector3;
    end: THREE.Vector3;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
}
//# sourceMappingURL=arrow.d.ts.map