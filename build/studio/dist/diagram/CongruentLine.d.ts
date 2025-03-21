import * as THREE from "three";
import * as Geometry from "../geometry/index.js";
export default class CongruentLine extends THREE.Group {
    constructor(ticks: number, start: THREE.Vector3, end: THREE.Vector3, config?: Geometry.Style & {
        tickLength?: number;
        spacing?: number;
    });
    moveToSegment(start: THREE.Vector3, end: THREE.Vector3): void;
}
//# sourceMappingURL=CongruentLine.d.ts.map