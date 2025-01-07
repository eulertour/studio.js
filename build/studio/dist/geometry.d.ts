import { MeshLine } from "./MeshLine/index.js";
import Shape, { type Style, type Transform } from "./shape.js";
import Line, { LineAttributes } from "./line.js";
import Arrow from "./arrow.js";
import Polygon, { PolygonAttributes } from "./polygon.js";
import Polyline from "./polyline.js";
import Arc, { ArcAttributes } from "./arc.js";
import Circle from "./circle.js";
import Point from "./point.js";
import Rectangle, { RectangleAttributes } from "./rectangle.js";
/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
declare class Square extends Rectangle {
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
export { Shape, Line, Arrow, Point, Circle, Arc, Polygon, Polyline, Rectangle, Square, MeshLine, };
export type { Transform, Style, PolygonAttributes, LineAttributes, ArcAttributes, RectangleAttributes, };
//# sourceMappingURL=geometry.d.ts.map