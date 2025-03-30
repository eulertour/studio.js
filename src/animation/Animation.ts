import { THREE } from "../index.js";

// From https://easings.net/
const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export const applyEasing = (
  t: number,
  dt: number,
  easingFunction: (_: number) => number,
  duration: number,
): [number, number] => {
  const easedTime = duration * easingFunction(t / duration);
  const previousEasedTime = duration * easingFunction((t - dt) / duration);
  const easedDeltaTime = easedTime - previousEasedTime;
  return [easedTime, easedDeltaTime];
};

export type AnimationConfig = {
  object?: THREE.Object3D;
  parent?: THREE.Object3D;
  before?: () => void;
  after?: () => void;
  family?: boolean;
  reveal?: boolean;
  hide?: boolean;
  easing?: (_: number) => number;
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
  public family;
  public reveal;
  public hide;
  public scale = 1;
  public runTime = 1;
  public finished = false;
  public elapsedSinceStart = 0;
  public easing: (_: number) => number;

  // family: whether or not the animation will affect the entire family
  // add: whether or not affected shapes will be added to their parents
  constructor(
    public func: (elapsedTime: number, deltaTime: number) => void,
    config: AnimationConfig = {},
  ) {
    this.object = config.object;
    this.parent = config.parent;
    this.before = config.before;
    this.after = config.after;
    this.family = config.family;
    this.reveal = config.reveal;
    this.hide = config.hide;
    this.easing = config.easing || easeInOutCubic;
  }

  get duration() {
    return this.endTime - this.startTime;
  }

  setUp() {
    if (this?.object?.parentComponent) {
      this.object.revealAncestors({ includeSelf: true });
    }
  }

  tearDown() {
    if (this.hide && this?.object?.parentComponent) {
      this.object.hide();
    }
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
      if (
        this.object !== undefined &&
        this.object.parent === undefined &&
        this.parent !== undefined
      ) {
        const parent = this.parent;
        !parent.children.includes(this.object) && parent.add(this.object);
      }
      this.beforeFunc?.();
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
      ...applyEasing(
        this.elapsedSinceStart,
        deltaTime,
        this.easing,
        this.duration,
      ),
    );

    if (worldTime >= this.endTime) {
      this.finished = true;
      this.tearDown();
      this.afterFunc?.();
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

export { Animation };
