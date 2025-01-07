import * as THREE from "three";
import { MeshLine } from "./MeshLine/index.js";
import Shape, { type Style, type Transform } from "./shape.js";
import Line, { LineAttributes } from "./line.js";
import Arrow from "./arrow.js";
import Polygon, { PolygonAttributes } from "./polygon.js";
import Polyline from "./polyline.js";
import Arc, { ArcAttributes } from "./arc.js";
import Circle from "./circle.js";
type RectangleAttributes = {
    width: number;
    height: number;
};
/**
 * A small circle representing a precise location in space.
 *
 * @example point.ts
 */
declare class Point extends Circle {
    constructor(position?: THREE.Vector2 | THREE.Vector3, config?: Style & {
        radius?: number;
    });
    static defaultConfig(): {
        radius: number;
        fill: boolean;
        closed: boolean;
    };
    getAttributes(): ArcAttributes;
    static fromAttributes(): Point;
}
/**
 * A shape with four sides and four right angles.
 *
 * @example rectangle.ts
 */
declare class Rectangle extends Shape {
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
    getCurveEndIndices(): Array<Array<number>>;
}
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