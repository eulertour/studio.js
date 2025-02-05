import * as THREE from "three";
import { setCameraDimensions, setCanvasViewport, } from "./geometry/MeshLine/MeshLineMaterial.js";
import { Animation } from "./animation/index.js";
import { setupCanvas } from "./utils.js";
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
        Object.defineProperty(this, "paused", {
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
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "endTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Number.POSITIVE_INFINITY
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
        Object.defineProperty(this, "three", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: THREE
        });
        Object.defineProperty(this, "viewport", {
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
        this.viewport = config.viewport;
        this.aspectRatio = config.aspectRatio;
        this.userScene = new UserScene(...setupCanvas(canvasRef, config));
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
            setCanvasViewport(this.viewport);
            setCameraDimensions(this.camera);
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
            this.userScene.update?.(this.deltaTime, this.elapsedTime);
            const roundedTime = Math.round(this.elapsedTime * this.timePrecision) / this.timePrecision;
            this.loopAnimations.forEach((animation) => animation.update(roundedTime));
        }
        catch (err) {
            throw new Error(`Error executing user animation: ${err.toString()}`);
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
        this.paused = false;
        this.userScene.renderer.setAnimationLoop((initialTime) => {
            let lastTime = initialTime;
            this.userScene.renderer.setAnimationLoop((time) => {
                const elapsedSinceLastFrame = (time - lastTime) / 1000;
                const lastFrameToEndInterval = this.endTime - this.elapsedTime;
                if (elapsedSinceLastFrame < lastFrameToEndInterval) {
                    this.tick(elapsedSinceLastFrame);
                    lastTime = time;
                }
                else {
                    this.tick(lastFrameToEndInterval);
                    this.pause();
                }
            });
        });
    }
    pause() {
        this.paused = true;
        this.userScene.renderer.setAnimationLoop(null);
    }
    dispose() {
        this.userScene.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
            else if (!(child instanceof THREE.Scene ||
                child instanceof THREE.Group ||
                child instanceof THREE.Mesh)) {
                console.warn("Can't dispose of object:", child);
            }
        });
        this.userScene.scene.clear();
    }
}
//# sourceMappingURL=scene.js.map