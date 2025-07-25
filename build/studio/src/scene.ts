import * as THREE from "three/webgpu";
import { Animation } from "./animation/index.js";
import { SceneCanvasConfig, setupCanvas } from "./utils.js";
import { ViewportManager } from "./ViewportManager.js";

export type AnimationRepresentation =
  | Animation
  | Array<Animation>
  | {
      animations: Array<Animation>;
      before?: () => void;
      after?: () => void;
      parent?: THREE.Object3D;
      runTime?: number;
      scale?: number;
    }
  | ((t: number, dt: number) => void);

type Class<T> = new (
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGPURenderer,
) => T;

export interface StudioScene<
  T extends THREE.Camera = THREE.OrthographicCamera,
> {
  scene: THREE.Scene;
  camera: T;
  renderer: THREE.WebGPURenderer;
  animations?: Array<AnimationRepresentation>;
  update?: (deltaTime: number, time: number) => void;
}

export type StudioSceneClass = Class<StudioScene>;

export class SceneController {
  animationIndex = 0;
  deltaTime = 0;
  elapsedTime = 0;
  firstFrame = true;
  fps = 60;
  timePrecision = 1e5;
  loopAnimations: Array<Animation> = [];
  finishedAnimationCount = 0;
  userScene: StudioScene;
  private _viewport: THREE.Vector4 | undefined;
  aspectRatio: number;

  constructor(
    public UserScene: StudioSceneClass,
    canvasRef: HTMLCanvasElement,
    config: SceneCanvasConfig,
  ) {
    const [scene, camera, renderer, aspectRatio] = setupCanvas(canvasRef, config);
    this.aspectRatio = aspectRatio;
    this.userScene = new UserScene(scene, camera, renderer);

    // Set viewport which will trigger the setter and update ViewportManager
    this.viewport = config.viewport;
  }

  get viewport(): THREE.Vector4 | undefined {
    return this._viewport;
  }

  set viewport(value: THREE.Vector4 | undefined) {
    this._viewport = value;
    const canvas = this.renderer?.domElement;
    if (canvas) {
      const screenSize = new THREE.Vector2(canvas.width, canvas.height);
      const devicePixelRatio =
        typeof window !== "undefined" ? window.devicePixelRatio : 1;
      ViewportManager.getInstance().setViewport(
        value,
        screenSize,
        devicePixelRatio,
      );
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
      this.userScene.renderer.render(
        this.userScene.scene,
        this.userScene.camera,
      );
    } else {
      const viewportArray = this.viewport.toArray();
      if (viewportArray.some(v => v < 0)) {
        console.warn(
          `Suppressed attempt to render with invalid viewport ${viewportArray}.`,
        );
        return;
      }

      this.renderer.setScissor(...viewportArray);
      this.renderer.setViewport(...viewportArray);
      this.renderer.setScissorTest(true);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }
  }

  tick(deltaTime: number, render = true) {
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
        } else if (typeof o === "function") {
          const animation = new Animation(o);
          animation.startTime = currentEndTime;
          animation.endTime = currentEndTime + animation.runTime;
          animation.parent = this.userScene.scene;
          this.loopAnimations.push(animation);
          currentEndTime = animation.endTime;
        } else if (typeof o === "object") {
          const animationArray = o.animations;
          const runTime = o.runTime || 1;
          const scale = o.scale || 1;
          const before = o.before || (() => {});
          const after = o.after || (() => {});
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
    } else {
      this.deltaTime = deltaTime;
      this.elapsedTime += deltaTime;
    }

    try {
      const roundedElapsedTime =
        Math.round(this.elapsedTime * this.timePrecision) / this.timePrecision;
      this.loopAnimations.forEach((animation) =>
        animation.update(roundedElapsedTime),
      );
      this.userScene.scene.traverse((object) => {
        object.update(this.deltaTime, this.elapsedTime);
      });
      this.userScene.update?.(this.deltaTime, this.elapsedTime);
    } catch (err: any) {
      console.error(`Error executing user animation: ${err.toString()}`);
      throw err;
    }

    const newFinishedAnimationCount = this.loopAnimations.reduce(
      (acc, cur) => acc + (cur.finished ? 1 : 0),
      0,
    );
    if (newFinishedAnimationCount !== this.finishedAnimationCount) {
      this.animationIndex += 1;
      this.finishedAnimationCount = newFinishedAnimationCount;
    }

    if (render) {
      this.render();
    }
  }

  play() {
    let lastTime: number;
    this.userScene.renderer.setAnimationLoop((time) => {
      const elapsedSinceLastFrame =
        lastTime !== undefined ? (time - lastTime) / 1000 : 0;
      this.tick(elapsedSinceLastFrame);
      lastTime = time;
    });
  }
}
