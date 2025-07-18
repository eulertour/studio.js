import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";

export default class Shift extends Animation {
  constructor(object: THREE.Object3D, offset: THREE.Vector3, config?: any) {
    super(
      (_elapsedTime, deltaTime) => {
        object.position.add(offset.clone().multiplyScalar(deltaTime));
      },
      {
        object,
        reveal: true,
        ...config,
      },
    );
  }
}

