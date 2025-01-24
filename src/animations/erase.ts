import { Animation } from "./animation.js";

export default class Erase extends Animation {
    constructor(
      public object,
      public config?,
    ) {
      super(
        (elapsedTime) => {
          object.stroke.material.uniforms.drawRange.value.y = 1 - elapsedTime;
        },
        { object, hide: true, ...config },
      );
    }
  
    tearDown() {
      if (this.config?.remove) {
        this.object.parent.remove(this.object);
      }
      if (this.config?.restore) {
        this.object.stroke.material.uniforms.drawRange.value.y = 1;
      }
      super.tearDown();
    }
  }