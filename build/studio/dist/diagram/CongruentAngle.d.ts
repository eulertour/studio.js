import * as THREE from "three";
import * as Geometry from "../geometry/index.js";
export default class CongruentAngle extends THREE.Group {
    config: Geometry.Style & {
        minRadius?: number;
        spacing?: number;
    };
    constructor(arcs: number, point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Geometry.Style & {
        minRadius?: number;
        spacing?: number;
    });
}
//# sourceMappingURL=CongruentAngle.d.ts.map