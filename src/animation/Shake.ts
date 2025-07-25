import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";

export default class Shake extends Animation {
  constructor(
    object: THREE.Object3D,
    config: { maxRotation?: number; frequency?: number } = {},
  ) {
    const { maxRotation = 0.05, frequency = 4 } = config;

    super(
      (_elapsedTime) => {
        const sine = maxRotation * Math.sin(frequency * Math.PI * _elapsedTime);
        object.rotation.z = sine;
      },
      { object, reveal: true, ...config },
    );
  }
}

