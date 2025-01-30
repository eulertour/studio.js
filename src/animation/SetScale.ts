import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class SetScale extends Animation {
    initialScale: number;
  
    constructor(object, factor, config?) {
      super(
        (elapsedTime) => {
          const scale = THREE.MathUtils.lerp(
            this.initialScale,
            factor,
            elapsedTime,
          );
          object.scale.set(scale, scale);
        },
        { object, reveal: true, ...config },
      );
    }
  
    setUp() {
      super.setUp();
      this.initialScale = this.object.scale.x;
    }
  }