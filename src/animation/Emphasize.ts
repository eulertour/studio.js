import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";
export default class Emphasize extends Animation {
  initialScale!: number;
  largeScale: number;
  keyframe = 0.9;

  constructor(object: THREE.Object3D, largeScale = 1.1, config?: any) {
    super(
      (elapsedTime) => {
        let scale;
        if (elapsedTime <= this.keyframe) {
          const t0 = elapsedTime / this.keyframe;
          scale = (1 - t0) * this.initialScale + t0 * this.largeScale;
        } else {
          const t0 = (elapsedTime - this.keyframe) / (1 - this.keyframe);
          scale = (1 - t0) * this.largeScale + t0 * this.initialScale;
        }
        this.object.scale.setScalar(scale);
      },
      { object, reveal: true, ...config },
    );
    this.largeScale = largeScale;
  }

  setUp() {
    super.setUp();
    this.initialScale = this.object.scale.x;
  }
}

