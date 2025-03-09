import * as THREE from "three";
import MeshLine from "./MeshLine/index.js";
export type Transform = {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
};
export type Style = {
    fillColor?: THREE.Color;
    fillOpacity?: number;
    strokeColor?: THREE.Color;
    strokeOpacity?: number;
    strokeWidth?: number;
    strokeDashLength?: number;
    strokeDashOffset?: number;
    dashed?: boolean;
};
type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
type Stroke = MeshLine;
/**
 * An abstract class representing a generalized shape.
 */
export default abstract class Shape extends THREE.Group {
    fill?: Fill;
    stroke?: Stroke;
    curveEndIndices: Array<Array<number>>;
    arrow: boolean;
    constructor(points: Array<THREE.Vector3>, config?: Style & {
        arrow?: boolean;
        stroke?: boolean;
        fill?: boolean;
        closed?: boolean;
        fillPoints?: Array<THREE.Vector3>;
    });
    forwardEvent: (e: any) => void;
    add(...objects: THREE.Object3D[]): this;
    remove(...objects: THREE.Object3D[]): this;
    addLabel(tex: string, direction: THREE.Vector3): void;
    static defaultStyle(): {
        fillColor: THREE.Color;
        fillOpacity: number;
        strokeColor: THREE.Color;
        strokeOpacity: number;
        strokeWidth: number;
        strokeDashLength: number;
        strokeDashOffset: number;
        dashed: boolean;
    };
    static defaultConfig(): {};
    reshape(...args: any[]): void;
    copyStroke(shape: Shape): void;
    copyFill(shape: Shape): void;
    copyStrokeAndFill(shape: Shape): void;
    get points(): Array<THREE.Vector3>;
    set points(newPoints: THREE.Vector3[]);
    worldPoint(index: number): THREE.Vector3;
    transformedPoint(index: number, targetSpace: THREE.Object3D): THREE.Vector3;
    segment(index: number): THREE.Line3;
    curve(curveIndex: number, worldTransform?: boolean): THREE.Vector3[];
    get numCurves(): number;
    getCurveEndIndices(): number[][];
    clear(): this;
    clone(recursive?: boolean): this;
    getClassConfig(): {};
    abstract getAttributes(): object;
    getCloneAttributes(): Array<unknown>;
    getStyle(): Style;
    restyle(style: Style, config?: {
        includeDescendents: boolean;
    }): void;
    copyStyle(shape: Shape): void;
    getTransform(): Transform;
    setTransform(transform: Transform): void;
    dispose(): this;
    getDimensions(): THREE.Vector2;
    closestPointToPoint(point: THREE.Vector3, target?: THREE.Vector3): THREE.Vector3;
}
export {};
//# sourceMappingURL=Shape.d.ts.map