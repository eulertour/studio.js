import * as THREE from "three/webgpu";
import { Animation } from "./animation/index.js";
import * as Geometry from "./geometry/index.js";
import * as Text from "./text.js";
import Angle from "./angle.js";
import { Shape } from "./geometry/index.js";
interface IndicatorConfig {
    tickLength?: number;
}
declare class Indicator extends THREE.Group {
    start: THREE.Vector3;
    end: THREE.Vector3;
    startTick: Geometry.Line;
    endTick: Geometry.Line;
    stem: Geometry.Line;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: IndicatorConfig & Geometry.Style);
    grow(config?: any): Animation;
}
declare class CongruentLine extends THREE.Group {
    constructor(ticks: number, start: THREE.Vector3, end: THREE.Vector3, config?: Geometry.Style & {
        tickLength?: number;
        spacing?: number;
    });
    moveToSegment(start: THREE.Vector3, end: THREE.Vector3): void;
}
declare class CongruentAngle extends Shape {
    arcs: number;
    point1: THREE.Vector3;
    point2: THREE.Vector3;
    point3: THREE.Vector3;
    config: Geometry.Style & {
        minRadius?: number;
        spacing?: number;
    };
    constructor(arcs: number, point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Geometry.Style & {
        minRadius?: number;
        spacing?: number;
    });
    getAttributes(): {
        arcs: number;
        point1: THREE.Vector3;
        point2: THREE.Vector3;
        point3: THREE.Vector3;
    };
}
declare class RightAngle extends Geometry.Polyline {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Geometry.Style & {
        sideLength?: number;
    });
}
declare class Number extends THREE.Group {
    static geometries: Map<string, THREE.ShapeGeometry>;
    meshes: THREE.Mesh[];
    material: THREE.MeshBasicMaterial;
    decimals: number;
    centerData: {
        center: THREE.Vector3;
        box: THREE.Box3;
        offset: THREE.Vector3;
        worldPosition: THREE.Vector3;
    };
    constructor(value?: number, config?: {
        color?: THREE.ColorRepresentation;
        decimals?: number;
    });
    reshape(value: number, config?: {
        color?: THREE.ColorRepresentation;
        decimals?: number;
    }): void;
    updateFromValue(value: number): void;
    static extractGeometry(textShape: Text.Text): THREE.ShapeGeometry;
    static initializeGeometries(): Map<string, THREE.ShapeGeometry>;
}
export { Indicator, Angle, RightAngle, CongruentLine, CongruentAngle, Number };
//# sourceMappingURL=diagram.d.ts.map