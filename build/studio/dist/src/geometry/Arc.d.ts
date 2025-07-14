import Shape from "./Shape.js";
import { type Style } from "./utils.js";
import { THREE } from "../index.js";
export type ArcAttributes = {
    radius: number;
    angle: number;
    closed: boolean;
};
/**
 * An arc.
 *
 * @example arc.ts
 */
export default class Arc extends Shape {
    radius: number;
    angle: number;
    closed: boolean;
    constructor(radius?: number, angle?: number, config?: Style & {
        closed?: boolean;
    });
    reshape(radius?: number, angle?: number, config?: Style & {
        closed?: boolean;
    }): void;
    getCloneAttributes(): (number | boolean)[];
    getAttributes(): ArcAttributes;
    static fromAttributes(attributes: ArcAttributes): Arc;
    get attributeData(): ({
        attribute: string;
        type: string;
        default: number;
    } | {
        attribute: string;
        type: string;
        default: boolean;
    })[];
    getDimensions(): THREE.Vector2;
}
//# sourceMappingURL=Arc.d.ts.map