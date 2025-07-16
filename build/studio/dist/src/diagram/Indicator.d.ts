import * as THREE from "three/webgpu";
import * as Geometry from "../geometry/index.js";
import { Animation } from "../animation/index.js";
interface IndicatorConfig {
    tickLength?: number;
}
export default class Indicator extends THREE.Group {
    start: THREE.Vector3;
    end: THREE.Vector3;
    startTick: Geometry.Line;
    endTick: Geometry.Line;
    stem: Geometry.Line;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: IndicatorConfig & Geometry.Style);
    grow(config?: any): Animation;
}
export {};
//# sourceMappingURL=Indicator.d.ts.map