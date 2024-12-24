import * as THREE from 'three';
import { Animation } from './animation';
import * as Geometry from './geometry';
import type { Style } from './geometry.types';
interface IndicatorConfig {
    tickLength?: number;
}
declare class Indicator extends THREE.Group {
    start: THREE.Vector3;
    end: THREE.Vector3;
    startTick: Geometry.Line;
    endTick: Geometry.Line;
    stem: any;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: IndicatorConfig & Style);
    grow(config?: any): Animation;
}
declare class CongruentLine extends THREE.Group {
    constructor(ticks: number, start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
        tickLength?: number;
        spacing?: number;
    });
}
declare class CongruentAngle extends THREE.Group {
    config: Style & {
        minRadius?: number;
        spacing?: number;
    };
    constructor(arcs: number, point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Style & {
        minRadius?: number;
        spacing?: number;
    });
}
declare class Angle extends Geometry.Arc {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Style & {
        radius?: number;
        reflex?: boolean;
    });
}
declare class RightAngle extends Geometry.Polyline {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Style & {
        sideLength?: number;
    });
}
export { Indicator, Angle, RightAngle, CongruentLine, CongruentAngle };
