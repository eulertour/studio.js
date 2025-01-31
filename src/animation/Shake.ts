import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class Shake extends Animation {
  constructor(object: THREE.Object3D, config?: any) {
    super(
      (_elapsedTime, deltaTime) => {
        const sine = .05 * Math.sin(4 * Math.PI * deltaTime);
        object.rotation.z = sine;
      },
      { object, reveal: true, ...config },
    );
  }
}






