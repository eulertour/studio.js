import Shape from "./Shape.js";
import { Style } from "./utils.js";
import { THREE } from "../index.js";
export type EllipseArcAttributes = {
    radiusA: number;
    radiusB: number;
    angle: number;
    closed: boolean;
};
/**
 * EllipseArc
 *
 * @example ellipseArc.ts
 */
export default class EllipseArc extends Shape {
    radiusA: number;
    radiusB: number;
    angle: number;
    closed: boolean;
    constructor(radiusA?: number, radiusB?: number, angle?: number, config?: Style & {
        closed?: boolean;
    });
    reshape(radiusA?: number, radiusB?: number, angle?: number, config?: Style & {
        closed?: boolean;
    }): void;
    getCloneAttributes(): (number | boolean)[];
    getAttributes(): EllipseArcAttributes;
    static fromAttributes(attributes: EllipseArcAttributes): EllipseArc;
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
//# sourceMappingURL=EllipseArc.d.ts.map