import Shape, { Style } from "./geometry/Shape.js";
import * as THREE from "three";
export type AngleAttributes = {
    point1: THREE.Vector3;
    point2: THREE.Vector3;
    point3: THREE.Vector3;
};
export default class Angle extends Shape {
    point1: THREE.Vector3;
    point2: THREE.Vector3;
    point3: THREE.Vector3;
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Style & {
        radius?: number;
        reflex?: boolean;
    });
    getAttributes(): {
        point1: THREE.Vector3;
        point2: THREE.Vector3;
        point3: THREE.Vector3;
    };
}
//# sourceMappingURL=angle.d.ts.map