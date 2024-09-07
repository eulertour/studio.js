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
    // family: whether or not the animation will affect the entire family
    // add: whether or not affected shapes will be added to their parents
    constructor(func, { object = undefined, parent = undefined, before = undefined, after = undefined, family = undefined, reveal = undefined, hide = undefined, } = {}) {
        this.func = func;
        this.scale = 1;
        this.runTime = 1;
        this.finished = false;
        this.elapsedSinceStart = 0;
        this.object = object;
        this.parent = parent;
        this.before = before;
        this.after = after;
        this.family = family;
        this.reveal = reveal;
        this.hide = hide;
    }
    setUp() {
        if (this.object.parentComponent) {
            this.object.revealAncestors({ includeSelf: true });
        }
    }
    tearDown() {
        if (this.hide && this.object.parentComponent) {
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
            this.beforeFunc && this.beforeFunc();
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
class Shift extends Animation {
    constructor(object, offset, config) {
        super((_elapsedTime, deltaTime) => {
            object.position.add(offset.clone().multiplyScalar(deltaTime));
        }, Object.assign({ object, reveal: true }, config));
    }
}
class MoveTo extends Animation {
    constructor(target, obj, config) {
        super((elapsedTime) => {
            obj.position
                .copy(this.start)
                .addScaledVector(this.displacement, elapsedTime);
        }, Object.assign({ obj, reveal: true }, config));
        this.target = target;
        this.obj = obj;
    }
    setUp() {
        super.setUp();
        this.start = this.obj.position.clone();
        const final = new THREE.Vector3();
        const initial = new THREE.Vector3();
        this.obj.parent.worldToLocal(getBoundingBoxCenter(this.target, final));
        this.obj.parent.worldToLocal(getBoundingBoxCenter(this.obj, initial));
        this.displacement = new THREE.Vector3().subVectors(final, initial);
    }
}
class Rotate extends Animation {
    constructor(object, angle, config) {
        super((_elapsedTime, deltaTime) => {
            object.rotation.z += angle * deltaTime;
        }, Object.assign({ object, reveal: true }, config));
    }
}
class SetScale extends Animation {
    constructor(object, factor, config) {
        const initialScale = object.scale.x;
        super((elapsedTime, deltaTime) => {
            const scale = THREE.MathUtils.lerp(initialScale, factor, elapsedTime);
            object.scale.set(scale, scale, scale);
        }, Object.assign({ object, reveal: true }, config));
    }
}
class Draw extends Animation {
    constructor(object, config) {
        super((elapsedTime) => {
            this.object.traverse((child) => {
                if (child.stroke) {
                    child.stroke.material.uniforms.drawRange.value.y = elapsedTime;
                }
            });
        }, Object.assign({ object, reveal: true }, config));
    }
}
class Erase extends Animation {
    constructor(object, config) {
        super((elapsedTime) => {
            object.stroke.material.uniforms.drawRange.value.y = 1 - elapsedTime;
        }, Object.assign({ object, hide: true }, config));
        this.object = object;
        this.config = config;
    }
    tearDown() {
        var _a, _b;
        if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.remove) {
            this.object.parent.remove(this.object);
        }
        if ((_b = this.config) === null || _b === void 0 ? void 0 : _b.restore) {
            this.object.stroke.material.uniforms.drawRange.value.y = 1;
        }
        super.tearDown();
    }
}
class FadeIn extends Animation {
    constructor(object, config) {
        let family = true;
        if (config && config.family === false) {
            family = false;
        }
        super((elapsedTime, _deltaTime) => {
            if (family) {
                this.object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material.opacity = THREE.MathUtils.lerp(0, (config === null || config === void 0 ? void 0 : config.preserveOpacity) ? this.initialOpacity.get(child) : 1, elapsedTime);
                    }
                });
            }
            else {
                [this.object.stroke, this.object.fill].forEach((mesh) => {
                    if (!mesh)
                        return;
                    mesh.material.opacity = THREE.MathUtils.lerp(0, (config === null || config === void 0 ? void 0 : config.preserveOpacity) ? this.initialOpacity.get(mesh) : 1, elapsedTime);
                });
            }
        }, Object.assign({ object, reveal: true }, config));
        this.initialOpacity = new Map();
    }
    setUp() {
        super.setUp();
        this.object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                this.initialOpacity.set(child, child.material.opacity);
            }
        });
    }
}
class FadeOut extends Animation {
    constructor(objectOrFunc, config) {
        let family = true;
        if (config && config.family === false) {
            family = false;
        }
        super((elapsedTime, _deltaTime) => {
            if (family) {
                this.object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        if (!this.initialOpacity.has(child)) {
                            console.error("Unknown child");
                        }
                        child.material.opacity = THREE.MathUtils.lerp(this.initialOpacity.get(child), 0, elapsedTime);
                    }
                });
            }
            else {
                [this.object.stroke, this.object.fill].forEach((mesh) => {
                    if (!mesh)
                        return;
                    mesh.material.opacity = THREE.MathUtils.lerp(this.initialOpacity.get(mesh), 0, elapsedTime);
                });
            }
        }, Object.assign({ object: objectOrFunc, hide: true }, config));
        this.config = config;
        this.initialOpacity = new Map();
    }
    setUp() {
        super.setUp();
        this.object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                this.initialOpacity.set(child, child.material.opacity);
            }
        });
    }
    tearDown() {
        var _a, _b;
        if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.remove) {
            this.object.parent.remove(this.object);
        }
        if ((_b = this.config) === null || _b === void 0 ? void 0 : _b.restore) {
            this.object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (!this.initialOpacity.has(child)) {
                        console.error("Unknown child");
                    }
                    child.material.opacity = this.initialOpacity.get(child);
                }
            });
        }
        super.tearDown();
    }
}
class Wait extends Animation {
    constructor(config) {
        super(() => { }, config);
    }
}
export { Animation, Shift, MoveTo, Rotate, SetScale, Draw, Erase, FadeIn, FadeOut, Wait, };
//# sourceMappingURL=animation.js.map