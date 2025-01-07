import Circle from "./circle.js";
import { Style } from "./shape.js";
import { ArcAttributes } from "./arc.js";
import { THREE } from "../index.js";
/**
 * A small circle representing a precise location in space.
 *
 * @example point.ts
 */
export default class Point extends Circle {
    constructor(position?: THREE.Vector2 | THREE.Vector3, config?: Style & {
        radius?: number;
    });
    static defaultConfig(): {
        radius: number;
        fill: boolean;
        closed: boolean;
    };
    getAttributes(): ArcAttributes;
    static fromAttributes(): Point;
}
//# sourceMappingURL=point.d.ts.map