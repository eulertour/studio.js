import { Shape } from "./geometry/index.js";
import * as THREE from "three/webgpu";
import { Utils } from "./index.js";
import { getArcPoints } from "./geometry/geometryUtils.js";
// TODO: Handle reflex angles.
export default class Angle extends Shape {
    constructor(point1, point2, point3, config = {}) {
        config = { radius: 0.4, reflex: false, ...config };
        const vector21 = new THREE.Vector3().subVectors(point1, point2);
        const vector23 = new THREE.Vector3().subVectors(point3, point2);
        const arcAngle = vector21.angleTo(vector23);
        let arcRotation;
        // TODO: Handle 180 degree angles
        if (Utils.positiveAngleTo(vector21, vector23) < Math.PI) {
            arcRotation = Utils.positiveAngleTo(Utils.RIGHT, vector21);
        }
        else {
            arcRotation = Utils.positiveAngleTo(Utils.RIGHT, vector23);
        }
        const points = getArcPoints(config.radius, arcAngle);
        config.fillPoints = [...points, new THREE.Vector3(0, 0, 0)];
        super(points, config);
        Object.defineProperty(this, "point1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point1
        });
        Object.defineProperty(this, "point2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point2
        });
        Object.defineProperty(this, "point3", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point3
        });
        this.position.copy(point2);
        this.rotateZ(arcRotation);
    }
    getAttributes() {
        return {
            point1: this.point1,
            point2: this.point2,
            point3: this.point3,
        };
    }
}
//# sourceMappingURL=angle.js.map