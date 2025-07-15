import * as THREE from "three";
import * as Geometry from "../geometry/index.js";
export default class RightAngle extends Geometry.Polyline {
    constructor(point1, point2, point3, config = {}) {
        config = { sideLength: 0.35, ...config };
        const vector21 = new THREE.Vector3()
            .subVectors(point1, point2)
            .setLength(config.sideLength);
        const vector23 = new THREE.Vector3()
            .subVectors(point3, point2)
            .setLength(config.sideLength);
        super([
            new THREE.Vector3().addVectors(point2, vector21),
            new THREE.Vector3().add(point2).add(vector21).add(vector23),
            new THREE.Vector3().addVectors(point2, vector23),
        ], config);
    }
}
//# sourceMappingURL=RightAngle.js.map