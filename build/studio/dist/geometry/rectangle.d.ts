import Shape, { Style } from "./Shape.js";
export type RectangleAttributes = {
    width: number;
    height: number;
};
/**
 * A shape with four sides and four right angles.
 *
 * @example rectangle.ts
 */
export default class Rectangle extends Shape {
    width: number;
    height: number;
    constructor(width?: number, height?: number, config?: Style);
    getCloneAttributes(): number[];
    getAttributes(): RectangleAttributes;
    static fromAttributes(attributes: RectangleAttributes): Rectangle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}
//# sourceMappingURL=Rectangle.d.ts.map