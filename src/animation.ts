import { clamp } from "./utils";
import * as THREE from "three";

let sigmoid = (x) => 1 / (1 + Math.exp(-x));
let smooth = (t) => {
  let error = sigmoid(-10 / 2);
  return clamp((sigmoid(10 * (t - 0.5)) - error) / (1 - 2 * error), 0, 1);
};

const modulate = (t, dt) => {
  let tSeconds = t;
  let modulatedDelta = smooth(tSeconds) - smooth(t - dt);
  let modulatedTime = smooth(tSeconds);
  return [modulatedTime, modulatedDelta];
};

class Animation {
  public scene;
  public startTime: number;
  public endTime: number;
  public prevUpdateTime: number;
  public beforeFunc: () => void;
  public afterFunc: () => void;
  public parent;

  constructor(
    public func: (elapsedTime: number, deltaTime: number) => void,
    { object } = {}
  ) {
    this.runTime = 1;
    this.scale = 1;
    this.object = object;
    this.reset();
  }

  reset() {
    this.elapsedSinceStart = 0;
    this.finished = false;
    this.beforeFunc = undefined;
    this.afterFunc = undefined;
  }

  update(worldTime) {
    if (worldTime <= this.startTime || this.finished) {
      return;
    }

    let deltaTime;
    if (this.prevUpdateTime === undefined) {
      this.beforeFunc && this.beforeFunc();
      deltaTime = worldTime - this.startTime;
    } else if (worldTime > this.endTime) {
      deltaTime = this.endTime - this.prevUpdateTime;
    } else {
      deltaTime = worldTime - this.prevUpdateTime;
    }
    this.prevUpdateTime = worldTime;
    this.elapsedSinceStart += deltaTime;

    this.func(
      ...modulate(
        this.elapsedSinceStart / (this.scale * this.runTime),
        deltaTime / (this.scale * this.runTime)
      ).map((t) => t * this.runTime)
    );

    if (worldTime >= this.endTime) {
      this.finished = true;
      this.afterFunc && this.afterFunc();
    }
  }

  addBefore(before) {
    if (this.beforeFunc) {
      const oldBeforeFunc = this.beforeFunc;
      this.beforeFunc = () => {
        before();
        oldBeforeFunc();
      };
    } else {
      this.beforeFunc = before;
    }
  }

  addAfter(after) {
    if (this.afterFunc) {
      const oldAfterFunc = this.afterFunc;
      this.afterFunc = () => {
        oldAfterFunc();
        after();
      };
    } else {
      this.afterFunc = after;
    }
  }

  setScene(scene) {
    this.beforeFunc = () => {
      if (this.object === undefined || this.object.parent !== null) {
        return;
      }

      const parent = this.parent ? this.parent : scene;
      !parent.children.includes(this.object) && parent.add(this.object);
    };
  }
}

const Shift = (object, direction) => {
  return new Animation(
    (_elapsedTime, deltaTime) => {
      object.position.add(direction.clone().multiplyScalar(deltaTime));
    },
    { object }
  );
};

const Rotate = (object, angle) => {
  return new Animation(
    (_elapsedTime, deltaTime) => {
      object.rotation.z += angle * deltaTime;
    },
    { object }
  );
};

const Scale = (object, finalScale) => {
  const initialScale = object.scale.x;
  return new Animation(
    (elapsedTime, deltaTime) => {
      const scale = THREE.MathUtils.lerp(initialScale, finalScale, elapsedTime);
      object.scale.set(scale, scale, scale);
    },
    { object }
  );
};

const Draw = (object) => {
  return new Animation(
    (elapsedTime) => {
      object.stroke.material.uniforms.drawRange.value.y = elapsedTime;
    },
    { object }
  );
};

const FadeIn = (object) => {
  return new Animation(
    (elapsedTime, _deltaTime) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.opacity = elapsedTime;
        }
      });
    },
    { object }
  );
};

export { Animation, Shift, Rotate, Scale, Draw, FadeIn };
