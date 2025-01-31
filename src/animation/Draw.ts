import { Animation } from "./Animation.js";
import * as THREE from "three";
export default class Draw extends Animation {
    constructor(object: THREE.Object3D, config?: any) {
      super(
        (elapsedTime) => {
          this.object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Line) {
              child.material.uniforms.drawRange.value.y = elapsedTime;
            }
          });
        },
        { object, reveal: true, ...config },
      );
    }
  }