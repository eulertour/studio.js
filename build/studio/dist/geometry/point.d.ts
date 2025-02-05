import Circle from "./Circle.js";
import { Style } from "./Shape.js";
import { ArcAttributes } from "./Arc.js";
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
    };
    getAttributes(): ArcAttributes;
    static fromAttributes(): Point;
}
//# sourceMappingURL=Point.d.ts.map