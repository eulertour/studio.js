// From https://easings.net/
const easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const applyEasing = (t, dt, easingFunction, duration) => {
    const easedTime = duration * easingFunction(t / duration);
    const previousEasedTime = duration * easingFunction((t - dt) / duration);
    const easedDeltaTime = easedTime - previousEasedTime;
    return [easedTime, easedDeltaTime];
};
class Animation {
    // family: whether or not the animation will affect the entire family
    // add: whether or not affected shapes will be added to their parents
    constructor(func, config = {}) {
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
        Object.defineProperty(this, "easing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
            if (this.object !== undefined &&
                this.object.parent === undefined &&
                this.parent !== undefined) {
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
        this.func(...applyEasing(this.elapsedSinceStart, deltaTime, this.easing, this.duration));
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
export { Animation };
//# sourceMappingURL=Animation.js.map