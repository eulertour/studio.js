import { Style } from "./shape.js";
import Rectangle, { RectangleAttributes } from "./rectangle.js";
/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
export default class Square extends Rectangle {
    sideLength: number;
    constructor(sideLength?: number, config?: Style);
    reshape(sideLength: number, config?: {}): void;
    getCloneAttributes(): number[];
    getAttributes(): RectangleAttributes;
    static fromAttributes(attributes: RectangleAttributes): Square;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}
//# sourceMappingURL=square.d.ts.map