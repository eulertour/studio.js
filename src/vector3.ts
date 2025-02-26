import * as THREE from "three";
import { Vector3 as BaseVector3 } from "three";
import * as Utils from "./utils.js";

class Vector3 extends BaseVector3 {
  rotate90(): Vector3 {
    return this.applyAxisAngle(Utils.OUT, Math.PI / 2);
  }

  rotate180(): Vector3 {
    return this.applyAxisAngle(Utils.OUT, Math.PI);
  }

  rotate270(): Vector3 {
    return this.applyAxisAngle(Utils.OUT, -Math.PI / 2);
  }

  rotateZ(angle: number): Vector3 {
    return this.applyAxisAngle(Utils.OUT, angle);
  }

  transformBetweenSpaces(
    from: THREE.Object3D,
    to: THREE.Object3D,
  ): THREE.Vector3 {
    return to.worldToLocal(from.localToWorld(this));
  }
}

export { Vector3 };
