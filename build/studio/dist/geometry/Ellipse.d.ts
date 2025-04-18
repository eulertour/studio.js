import Shape, { Style } from "./Shape.js";
export type EllipseAttributes = {
    radiusA: number;
    radiusB: number;
};
export default class Ellipse extends Shape {
    radiusA: number;
    radiusB: number;
    constructor(radiusA?: number, radiusB?: number, config?: Style);
    reshape(radiusA: number, radiusB: number, config?: {}): void;
    getCloneAttributes(): number[];
    getAttributes(): EllipseAttributes;
    static fromAttributes(attributes: EllipseAttributes): Ellipse;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}
//# sourceMappingURL=Ellipse.d.ts.map