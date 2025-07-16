import * as THREE from "three/webgpu";
import * as Geometry from "../geometry/index.js";
export default class RightAngle extends Geometry.Polyline {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Geometry.Style & {
        sideLength?: number;
    });
}
//# sourceMappingURL=RightAngle.d.ts.map