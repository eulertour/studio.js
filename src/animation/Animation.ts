import { clamp } from "../utils.js";

// From https://easings.net/
const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export const applyEasing = (
  t: number,
  dt: number,
  easingFunction: (_: number) => number,
): [number, number] => {
  const tSeconds = t;
  const modulatedDelta = easingFunction(tSeconds) - easingFunction(t - dt);
  const modulatedTime = easingFunction(tSeconds);
  return [modulatedTime, modulatedDelta];
};

interface IAnimation {
  // biome-ignore lint/suspicious/noMisleadingInstantiator:
  constructor(
    func: (elapsedTime: number, deltaTime: number) => void,
    config?: any,
  ): Animation;
}

interface INoConfigAnimation {
  // biome-ignore lint/suspicious/noMisleadingInstantiator:
  constructor(
    func: (elapsedTime: number, deltaTime: number) => void,
    config?: any,
  ): Animation;
}

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
    {
      object = undefined,
      parent = undefined,
      before = undefined,
      after = undefined,
      family = undefined,
      reveal = undefined,
      hide = undefined,
      easing = undefined,
    } = {},
  ) {
    this.object = object;
    this.parent = parent;
    this.before = before;
    this.after = after;
    this.family = family;
    this.reveal = reveal;
    this.hide = hide;
    this.easing = easing || easeInOutCubic;
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
      if (this.object !== undefined && this.object.parent === null) {
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

    this.func(...applyEasing(this.elapsedSinceStart, deltaTime, this.easing));

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
