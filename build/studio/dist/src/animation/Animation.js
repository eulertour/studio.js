import { clamp } from "../utils.js";
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const smooth = (t) => {
    const error = sigmoid(-10 / 2);
    return clamp((sigmoid(10 * (t - 0.5)) - error) / (1 - 2 * error), 0, 1);
};
const modulate = (t, dt) => {
    const tSeconds = t;
    const modulatedDelta = smooth(tSeconds) - smooth(t - dt);
    const modulatedTime = smooth(tSeconds);
    return [modulatedTime, modulatedDelta];
};
class Animation {
    // family: whether or not the animation will affect the entire family
    // add: whether or not affected shapes will be added to their parents
    constructor(func, { object = undefined, parent = undefined, before = undefined, after = undefined, family = undefined, reveal = undefined, hide = undefined, } = {}) {
        Object.defineProperty(this, "func", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: func
        });
        Object.defineProperty(this, "scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prevUpdateTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "beforeFunc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "afterFunc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "object", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "before", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "after", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "family", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reveal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hide", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "runTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "finished", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "elapsedSinceStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
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
        }
        else if (worldTime > this.endTime) {
            deltaTime = this.endTime - this.prevUpdateTime;
        }
        else {
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
        }
        else {
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
        }
        else {
            this.afterFunc = after;
        }
    }
}
export { Animation, };
//# sourceMappingURL=Animation.js.map