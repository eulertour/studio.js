import { clamp, getBoundingBoxCenter } from "./utils";
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
  public object;
  public before;
  public after;
  public scale;
  public finished: boolean;

  constructor(
    public func: (elapsedTime: number, deltaTime: number) => void,
    { object, parent, before, after, scale } = {}
  ) {
    this.runTime = 1;
    this.scale = scale || 1;
    this.object = object;
    this.parent = parent;
    this.before = before;
    this.after = after;
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
      if (this.object instanceof Function) {
        this.object = this.object();
      }
      if (this.object !== undefined && this.object.parent === null) {
        const parent = this.parent;
        !parent.children.includes(this.object) && parent.add(this.object);
      }
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
}

const Shift = (object, direction, config?) => {
  return new Animation(
    (_elapsedTime, deltaTime) => {
      object.position.add(direction.clone().multiplyScalar(deltaTime));
    },
    { object, ...config }
  );
};

const MoveTo = (target: THREE.Mesh, obj: THREE.Mesh, config?) => {
  let start: THREE.Vector3;
  let displacement: THREE.Vector3;

  const animation = new Animation(
    elapsedTime => {
      if (start === undefined) {
        start = obj.position.clone();
      }
      if (displacement === undefined) {
        const final = new THREE.Vector3();
        const initial = new THREE.Vector3();
        obj.parent.worldToLocal(getBoundingBoxCenter(target, final));
        obj.parent.worldToLocal(getBoundingBoxCenter(obj, initial));
        displacement = new THREE.Vector3().subVectors(final, initial);
      }
      obj
        .position
        .copy(start)
        .addScaledVector(displacement, elapsedTime);
    },
    { obj, ...config }
  );
  
  return animation;
};

const Rotate = (object, angle, config?) => {
  return new Animation(
    (_elapsedTime, deltaTime) => {
      object.rotation.z += angle * deltaTime;
    },
    { object, ...config }
  );
};

const Scale = (object, factor, config?) => {
  const initialScale = object.scale.x;
  return new Animation(
    (elapsedTime, deltaTime) => {
      const scale = THREE.MathUtils.lerp(initialScale, factor, elapsedTime);
      object.scale.set(scale, scale, scale);
    },
    { object, ...config }
  );
};

const Draw = (object, config?) => {
  return new Animation(
    (elapsedTime) => {
      object.stroke.material.uniforms.drawRange.value.y = elapsedTime;
    },
    { object, ...config }
  );
};

const Erase = (object, config?) => {
  const animation = new Animation(
    (elapsedTime) => {
      object.stroke.material.uniforms.drawRange.value.y = 1 - elapsedTime;
    },
    { object, ...config }
  );
  animation.addAfter(() => {
    object.parent.remove(object);
    object.stroke.material.uniforms.drawRange.value.y = 1;
  });
  return animation;
};

const FadeIn = (objectOrFunc, config?) => {
  let object;
  const initialOpacity = new Map();

  const animation = new Animation(
    (elapsedTime, _deltaTime) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.opacity = THREE.MathUtils.lerp(
            0,
            initialOpacity.get(child),
            elapsedTime
          );
        }
      });
    }, {
      object: () => {
        object = objectOrFunc instanceof Function
          ? objectOrFunc()
          : objectOrFunc;
        return object;
      },
      ...config
    }
  );

  animation.addBefore(() => {
    object.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        initialOpacity.set(child, child.material.opacity);
      }
    });
  });

  return animation;
};

const FadeOut = (objectOrFunc, config?) => {
  let object;
  if (!(objectOrFunc instanceof Function)) {
    object = objectOrFunc;
  } else {
    objectOrFunc = () => { object = objectOrFunc(); return object; }
  }

  const initialOpacity = new Map();

  const animation = new Animation(
    (elapsedTime, _deltaTime) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!initialOpacity.has(child)) {
            console.error("Unknown child");
          }
          child.material.opacity = THREE.MathUtils.lerp(
            initialOpacity.get(child),
            0,
            elapsedTime
          );
        }
      });
    },
    { object: objectOrFunc, ...config }
  );

  animation.addBefore(() => {
    object.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        initialOpacity.set(child, child.material.opacity);
      }
    });
  });

  animation.addAfter(() => {
    object.parent.remove(object);
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.opacity = initialOpacity.get(child);
      }
    });
  });

  return animation;
};

const Wait = (config?) => {
  return new Animation(() => {}, config);
};

export {
  Animation,
  Shift,
  MoveTo,
  Rotate,
  Scale,
  Draw,
  Erase,
  FadeIn,
  FadeOut,
  Wait,
};
