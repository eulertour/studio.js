import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class Shift extends Animation {
  totalDeltaTime = 0;
  constructor(object: THREE.Object3D, offset: THREE.Vector3, config?: any) {
    super(
      (_, deltaTime) => {
        object.position.add(
          offset.clone().multiplyScalar(deltaTime / this.duration),
        );
      },
      {
        object,
        reveal: true,
        ...config,
      },
    );
  }
}

