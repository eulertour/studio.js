import * as THREE from "three";
import { Animation } from "./animation.js";
import * as Geometry from "./geometry/index.js";
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
}
declare class CongruentAngle extends THREE.Group {
    config: Geometry.Style & {
        minRadius?: number;
        spacing?: number;
    };
    constructor(arcs: number, point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Geometry.Style & {
        minRadius?: number;
        spacing?: number;
    });
}
declare class Angle extends Geometry.Arc {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Geometry.Style & {
        radius?: number;
        reflex?: boolean;
    });
}
declare class RightAngle extends Geometry.Polyline {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Geometry.Style & {
        sideLength?: number;
    });
}
export { Indicator, Angle, RightAngle, CongruentLine, CongruentAngle };
//# sourceMappingURL=diagram.d.ts.map