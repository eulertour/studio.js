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
  public finished = false;
  public elapsedSinceStart = 0;

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
  }
  
  setUp() {}

  tearDown() {}

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
      this.setUp();
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
      this.tearDown();
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

class Shift extends Animation {
  constructor(object, direction, config?) {
    super(
      (_elapsedTime, deltaTime) => {
        object.position.add(direction.clone().multiplyScalar(deltaTime));
      },
      { object, ...config }
    );
  } 
}

class MoveTo extends Animation {
  public start;
  public displacement;

  constructor(public target: THREE.Mesh, public obj: THREE.Mesh, config?) {
    super(
      elapsedTime => {
        obj
          .position
          .copy(this.start)
          .addScaledVector(this.displacement, elapsedTime);
      },
      { obj, ...config }
    )
  }
  
  setUp() {
    this.start = this.obj.position.clone();

    const final = new THREE.Vector3();
    const initial = new THREE.Vector3();
    this.obj.parent.worldToLocal(getBoundingBoxCenter(this.target, final));
    this.obj.parent.worldToLocal(getBoundingBoxCenter(this.obj, initial));
    this.displacement = new THREE.Vector3().subVectors(final, initial);
  }
}

class Rotate extends Animation {
  constructor(object, angle, config?) {
    super(
      (_elapsedTime, deltaTime) => {
        object.rotation.z += angle * deltaTime;
      },
      { object, ...config }
    );
  }
}

class Scale extends Animation {
  constructor(object, factor, config?) {
    const initialScale = object.scale.x;
    super(
      (elapsedTime, deltaTime) => {
        const scale = THREE.MathUtils.lerp(initialScale, factor, elapsedTime);
        object.scale.set(scale, scale, scale);
      },
      { object, ...config }
    );
  }
} 

class Draw extends Animation {
  constructor(object, config?) {
    super(
      (elapsedTime) => {
        object.stroke.material.uniforms.drawRange.value.y = elapsedTime;
      },
      { object, ...config }
    );
  }
}

class Erase extends Animation {
  constructor(public object, public config?) {
    super(
      (elapsedTime) => {
        object.stroke.material.uniforms.drawRange.value.y = 1 - elapsedTime;
      },
      { object, ...config }
    );
  }
  
  tearDown() {
    if (this.config?.remove) {
      this.object.parent.remove(this.object);
    }
    if (this.config?.restore) {
      this.object.stroke.material.uniforms.drawRange.value.y = 1;
    }
  }
}

class FadeIn extends Animation {
  public initialOpacity = new Map();

  constructor(object, config?) {
    super(
      (elapsedTime, _deltaTime) => {
        this.object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.opacity = THREE.MathUtils.lerp(
              0,
              this.initialOpacity.get(child),
              elapsedTime
            );
          }
        });
      },
      { object, ...config }
    );
  }
  
  setUp() {
    this.object.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        this.initialOpacity.set(child, child.material.opacity);
      }
    });
  }
}

class FadeOut extends Animation {
  initialOpacity = new Map();

  constructor(objectOrFunc, public config?) {
    super(
      (elapsedTime, _deltaTime) => {
        this.object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (!this.initialOpacity.has(child)) {
              console.error("Unknown child");
            }
            child.material.opacity = THREE.MathUtils.lerp(
              this.initialOpacity.get(child),
              0,
              elapsedTime
            );
          }
        });
      },
      { object: objectOrFunc, ...config }
    );
  }
  
  setUp() {
    this.object.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        this.initialOpacity.set(child, child.material.opacity);
      }
    });
  }

  tearDown() {
    if (this.config?.remove) {
      this.object.parent.remove(this.object);
    }
    if (this.config?.restore) {
      this.object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!this.initialOpacity.has(child)) {
            console.error("Unknown child");
          }
          child.material.opacity = this.initialOpacity.get(child);
        }
      });
    }
  }
}

class Wait extends Animation {
  constructor(config?) {
    super(() => {}, config);
  }
}

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
