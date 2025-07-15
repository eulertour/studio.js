import * as THREE from "three/webgpu";
import { Animation } from "./animation/index.js";
import { setupCanvas } from "./utils.js";
import { ViewportManager } from "./ViewportManager.js";
export class SceneController {
    constructor(UserScene, canvasRef, config) {
        Object.defineProperty(this, "UserScene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: UserScene
        });
        Object.defineProperty(this, "animationIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "deltaTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "elapsedTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "firstFrame", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "fps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 60
        });
        Object.defineProperty(this, "timePrecision", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1e5
        });
        Object.defineProperty(this, "loopAnimations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "finishedAnimationCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "userScene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_viewport", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "aspectRatio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const [scene, camera, renderer, aspectRatio] = setupCanvas(canvasRef, config);
        this.aspectRatio = aspectRatio;
        this.userScene = new UserScene(scene, camera, renderer);
        // Set viewport which will trigger the setter and update ViewportManager
        this.viewport = config.viewport;
    }
    get viewport() {
        return this._viewport;
    }
    set viewport(value) {
        this._viewport = value;
        const canvas = this.renderer?.domElement;
        if (canvas) {
            const screenSize = new THREE.Vector2(canvas.width, canvas.height);
            const devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1;
            ViewportManager.getInstance().setViewport(value, screenSize, devicePixelRatio);
        }
    }
    get scene() {
        return this.userScene.scene;
    }
    get camera() {
        return this.userScene.camera;
    }
    get renderer() {
        return this.userScene.renderer;
    }
    render() {
        if (!this.viewport) {
            this.renderer.clear();
            this.userScene.renderer.render(this.userScene.scene, this.userScene.camera);
        }
        else {
            const viewportArray = this.viewport.toArray();
            this.renderer.setScissor(...viewportArray);
            this.renderer.setViewport(...viewportArray);
            this.renderer.setScissorTest(true);
            this.renderer.clear();
            this.renderer.render(this.scene, this.camera);
        }
    }
    tick(deltaTime, render = true) {
        if (this.firstFrame) {
            this.deltaTime = 0;
            this.elapsedTime = 0;
            this.firstFrame = false;
            let currentEndTime = 0;
            this.userScene.animations?.forEach((o) => {
                if (Array.isArray(o)) {
                    o = { animations: o };
                }
                if (o instanceof Animation) {
                    const animation = o;
                    animation.startTime = currentEndTime;
                    animation.endTime = currentEndTime + animation.runTime;
                    animation.parent = animation.parent || this.userScene.scene;
                    animation.before && animation.addBefore(animation.before);
                    animation.after && animation.addAfter(animation.after);
                    this.loopAnimations.push(animation);
                    currentEndTime = animation.endTime;
                }
                else if (typeof o === "function") {
                    const animation = new Animation(o);
                    animation.startTime = currentEndTime;
                    animation.endTime = currentEndTime + animation.runTime;
                    animation.parent = this.userScene.scene;
                    this.loopAnimations.push(animation);
                    currentEndTime = animation.endTime;
                }
                else if (typeof o === "object") {
                    const animationArray = o.animations;
                    const runTime = o.runTime || 1;
                    const scale = o.scale || 1;
                    const before = o.before || (() => { });
                    const after = o.after || (() => { });
                    for (let i = 0; i < animationArray.length; i++) {
                        const animation = animationArray[i];
                        animation.startTime = currentEndTime;
                        animation.endTime = currentEndTime + runTime * scale;
                        animation.runTime = runTime;
                        animation.scale = scale;
                        animation.before && animation.addBefore(animation.before);
                        animation.after && animation.addAfter(animation.after);
                        animation.parent =
                            animation.parent || o.parent || this.userScene.scene;
                        this.loopAnimations.push(...animationArray);
                    }
                    animationArray.at(0).addBefore(before);
                    animationArray.at(-1).addAfter(after);
                    currentEndTime = animationArray[0].endTime;
                }
            });
        }
        else {
            this.deltaTime = deltaTime;
            this.elapsedTime += deltaTime;
        }
        try {
            const roundedElapsedTime = Math.round(this.elapsedTime * this.timePrecision) / this.timePrecision;
            this.loopAnimations.forEach((animation) => animation.update(roundedElapsedTime));
            this.userScene.scene.traverse((object) => {
                object.update(this.deltaTime, this.elapsedTime);
            });
            this.userScene.update?.(this.deltaTime, this.elapsedTime);
        }
        catch (err) {
            console.error(`Error executing user animation: ${err.toString()}`);
            throw err;
        }
        const newFinishedAnimationCount = this.loopAnimations.reduce((acc, cur) => acc + (cur.finished ? 1 : 0), 0);
        if (newFinishedAnimationCount !== this.finishedAnimationCount) {
            this.animationIndex += 1;
            this.finishedAnimationCount = newFinishedAnimationCount;
        }
        if (render) {
            this.render();
        }
    }
    play() {
        let lastTime;
        this.userScene.renderer.setAnimationLoop((time) => {
            const elapsedSinceLastFrame = lastTime !== undefined ? (time - lastTime) / 1000 : 0;
            this.tick(elapsedSinceLastFrame);
            lastTime = time;
        });
    }
}
//# sourceMappingURL=scene.js.map