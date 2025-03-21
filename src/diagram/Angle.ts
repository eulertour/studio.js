import Shape, { Style } from "../geometry/Shape.js";
import * as THREE from "three";
import { Utils } from "../index.js";
import { getArcPoints } from "../geometry/geometryUtils.js";

// TODO: This should be radius, angle, and rotation.
export type AngleAttributes = {
  point1: THREE.Vector3;
  point2: THREE.Vector3;
  point3: THREE.Vector3;
};

// TODO: Handle reflex angles.
export default class Angle extends Shape {
  constructor(
    public point1: THREE.Vector3,
    public point2: THREE.Vector3,
    public point3: THREE.Vector3,
    config: Style & { radius?: number; reflex?: boolean } = {},
  ) {
    config = { radius: 0.4, reflex: false, ...config };
    const vector21 = new THREE.Vector3().subVectors(point1, point2);
    const vector23 = new THREE.Vector3().subVectors(point3, point2);

    const arcAngle = vector21.angleTo(vector23);
    let arcRotation: number;
    // TODO: Handle 180 degree angles
    if (Utils.positiveAngleTo(vector21, vector23) < Math.PI) {
      arcRotation = Utils.positiveAngleTo(Utils.RIGHT, vector21);
    } else {
      arcRotation = Utils.positiveAngleTo(Utils.RIGHT, vector23);
    }

    const points = getArcPoints(config.radius, arcAngle);
    config.fillPoints = [...points, new THREE.Vector3(0, 0, 0)];

    super(points, config);

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
