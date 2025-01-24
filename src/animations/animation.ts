import { clamp } from "../utils.js";
import Shift from "./shift.js";
import MoveTo from "./Moveto.js";
import Rotate from "./rotate.js";
import Draw from "./draw.js";
import Erase from "./erase.js";
import SetScale from "./setscale.js";
import FadeIn from "./fadein.js";
import SetOpacity from "./setopacity.js";
import FadeOut from "./fadeout.js";
import Wait from "./wait.js";
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const smooth = (t) => {
  const error = sigmoid(-10 / 2);
  return clamp((sigmoid(10 * (t - 0.5)) - error) / (1 - 2 * error), 0, 1);
};

const modulate = (t, dt): [number, number] => {
  const tSeconds = t;
  const modulatedDelta = smooth(tSeconds) - smooth(t - dt);
  const modulatedTime = smooth(tSeconds);
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
    } = {},
  ) {
    this.object = object;
    this.parent = parent;
    this.before = before;
    this.after = after;
    this.family = family;
    this.reveal = reveal;
    this.hide = hide;
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

    this.func(...modulate(this.elapsedSinceStart, deltaTime));

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

export {
  Animation,
  Shift,
  MoveTo,
  Rotate,
  SetScale,
  Draw,
  Erase,
  FadeIn,
  FadeOut,
  SetOpacity,
  Wait,
};
