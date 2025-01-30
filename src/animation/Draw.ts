import { Animation } from "./Animation.js";

export default class Draw extends Animation {
    constructor(object, config?) {
      super(
        (elapsedTime) => {
          this.object.traverse((child) => {
            if (child.stroke) {
              child.stroke.material.uniforms.drawRange.value.y = elapsedTime;
            }
          });
        },
        { object, reveal: true, ...config },
      );
    }
  }