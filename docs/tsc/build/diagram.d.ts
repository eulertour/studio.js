import * as THREE from "three";
import { Animation } from "./animation";
import { Style } from "./geometry.types";
import * as Geometry from "./geometry";
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
declare class Congruent extends THREE.Group {
    ticks: number;
    constructor(ticks: number, config?: Style & {
        tickLength?: number;
        spacing?: number;
    });
    moveToSegment(start: THREE.Vector3, end: THREE.Vector3): this;
}
export { Indicator, Congruent };
