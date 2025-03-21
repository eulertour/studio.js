import * as THREE from "three";
import * as Geometry from "../geometry/index.js";
import Shape from "../geometry/Shape.js";
export default class CongruentAngle extends Shape {
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
//# sourceMappingURL=CongruentAngle.d.ts.map