import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class Rotate extends Animation {
  constructor(object: THREE.Object3D, angle: number, config?: any) {
    super(
      (_elapsedTime, deltaTime) => {
        object.rotation.z += angle * deltaTime;
      },
      { object, reveal: true, ...config },
    );
  }
}