import Shape, { Style } from "./Shape.js";
export type CircleAttributes = {
    radius: number;
};
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
export default class Circle extends Shape {
    radius: number;
    constructor(radius?: number, config?: Style);
    reshape(radius: number, config?: {}): void;
    getCloneAttributes(): number[];
    getAttributes(): CircleAttributes;
    static fromAttributes(attributes: CircleAttributes): Circle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}
//# sourceMappingURL=Circle.d.ts.map