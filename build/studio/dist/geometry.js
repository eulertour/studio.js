import { MeshLine } from "./MeshLine/index.js";
import Shape from "./shape.js";
import Line from "./line.js";
import Arrow from "./arrow.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";
import Arc from "./arc.js";
import Circle from "./circle.js";
import Point from "./point.js";
import Rectangle from "./rectangle.js";
/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
class Square extends Rectangle {
    constructor(sideLength = 2, config = {}) {
        super(sideLength, sideLength, { ...Square.defaultConfig(), ...config });
        Object.defineProperty(this, "sideLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: sideLength
        });
    }
    reshape(sideLength, config = {}) {
        this.sideLength = sideLength;
        this.copyStrokeFill(new Square(sideLength, config));
    }
    getCloneAttributes() {
        return [this.sideLength];
    }
    getAttributes() {
        return {
            width: this.sideLength,
            height: this.sideLength,
        };
    }
    static fromAttributes(attributes) {
        const { width } = attributes;
        return new Square(width);
    }
    get attributeData() {
        return [
            {
                attribute: "sideLength",
                type: "number",
                default: 2,
            },
        ];
    }
}
export { Shape, Line, Arrow, Point, Circle, Arc, Polygon, Polyline, Rectangle, Square, MeshLine, };
//# sourceMappingURL=geometry.js.map