import * as THREE from "three";
import { MeshLine } from "./MeshLine/index.js";
import Shape, { type Style, type Transform } from "./shape.js";
import Line, { LineAttributes } from "./line.js";
import Arrow from "./arrow.js";
import Polygon, { PolygonAttributes } from "./polygon.js";
import Polyline from "./polyline.js";
type ArcAttributes = {
    radius: number;
    angle: number;
    closed: boolean;
};
type RectangleAttributes = {
    width: number;
    height: number;
};
/**
 * A part of a circle's circumference.
 *
 * @example arc.ts
 */
declare class Arc extends Shape {
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
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
declare class Circle extends Arc {
    constructor(radius?: number, config?: Style & {
        fill?: boolean;
    });
    reshape(radius: number, config?: {}): void;
    static defaultConfig(): {
        fill: boolean;
        closed: boolean;
    };
    getCloneAttributes(): number[];
    getAttributes(): ArcAttributes;
    static fromAttributes(attributes: ArcAttributes): Circle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}
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