import * as THREE from "three";
import { MeshLine } from "./MeshLine";
import type { Transform, Style, LineAttributes, PolygonAttributes, ArcAttributes, RectangleAttributes } from "./geometry.types.js";
type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
type Stroke = MeshLine;
declare abstract class Shape extends THREE.Group {
    fill: Fill;
    stroke: Stroke;
    curveEndIndices: Array<Array<number>>;
    constructor(points: Array<THREE.Vector3>, config?: Style & ArrowConfig);
    reshape(...args: any[]): void;
    copyStroke(shape: Shape): void;
    copyFill(shape: Shape): void;
    copyStrokeFill(shape: Shape): void;
    get points(): Array<THREE.Vector3>;
    segment(index: number): THREE.Line3;
    curve(curveIndex: number, worldTransform?: boolean): THREE.Vector3[];
    get numCurves(): number;
    getCurveEndIndices(): any[];
    clear(): this;
    clone(recursive?: boolean): this;
    getClassConfig(): {};
    abstract getAttributes(): object;
    getCloneAttributes(): Array<unknown>;
    getStyle(): Style;
    setStyle(style: Style): void;
    getTransform(): Transform;
    setTransform(transform: Transform): void;
    dispose(): this;
    getDimensions(): THREE.Vector2;
    closestPointToPoint(point: THREE.Vector3, target?: THREE.Vector3): THREE.Vector3;
}
interface ArrowConfig {
    arrow?: boolean;
}
interface ArcConfig {
    closed?: boolean;
}
declare class Line extends Shape {
    start: THREE.Vector3;
    end: THREE.Vector3;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style & ArrowConfig);
    static centeredLine(start: THREE.Vector3, end: THREE.Vector3, config?: Style): Line;
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style & ArrowConfig): void;
    getClassConfig(): {};
    getAttributes(): LineAttributes;
    toVector(global: boolean): THREE.Vector3;
    static fromAttributes(attributes: LineAttributes): Line;
}
declare class Arrow extends Line {
    start: THREE.Vector3;
    end: THREE.Vector3;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
}
declare class Polyline extends Shape {
    constructor(points: Array<THREE.Vector3>, config?: Style);
    reshape(points: Array<THREE.Vector3>, config?: Style): void;
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polyline;
}
declare class Arc extends Shape {
    radius: number;
    angle: number;
    closed: boolean;
    constructor(radius?: number, angle?: number, config?: Style & ArcConfig);
    reshape(radius?: number, angle?: number, config?: Style & ArcConfig): void;
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
declare class Circle extends Arc {
    constructor(radius?: number, config?: Style);
    reshape(radius: number, config?: {}): void;
    getCloneAttributes(): number[];
    getAttributes(): ArcAttributes;
    static fromAttributes(attributes: ArcAttributes): Circle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}
declare class Point extends Circle {
    constructor(position?: THREE.Vector2 | THREE.Vector3, config?: Style & {
        radius?: number;
    });
    getAttributes(): ArcAttributes;
    static fromAttributes(): Point;
}
declare class Polygon extends Shape {
    constructor(points: Array<THREE.Vector3>, config?: Style);
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polygon;
    get attributeData(): any[];
}
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
/** This is a square. */
declare class Square extends Rectangle {
    sideLength: number;
    constructor(sideLength?: number, config?: {});
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
export { Shape, Line, Arrow, Point, Circle, Arc, Polygon, Polyline, Rectangle, Square, };
