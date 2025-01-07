import Shape, { Style } from "./shape.js";
import { THREE } from "../index.js";
/**
 * A part of a circle's circumference.
 *
 * @example arc.ts
 */
export type ArcAttributes = {
    radius: number;
    angle: number;
    closed: boolean;
};
export default class Arc extends Shape {
    radius: number;
    angle: number;
    closed: boolean;
    constructor(radius?: number, angle?: number, config?: Style & {
        closed?: boolean;
    });
    static defaultConfig(): {
        closed: boolean;
        fill: boolean;
    };
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
//# sourceMappingURL=arc.d.ts.map