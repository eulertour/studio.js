import * as THREE from "three";
import { Animation } from "./animation";
import {
  type HeightSetupConfig,
  type WidthSetupConfig,
  setupCanvas,
} from "./utils";
import {
  setCanvasViewport,
  setCameraDimensions,
} from "./MeshLine/MeshLineMaterial";

type Class<T> = new (
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
) => T;

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
    };

export interface StudioScene<
  T extends THREE.Camera = THREE.OrthographicCamera,
> {
  scene: THREE.Scene;
  camera: T;
  renderer: THREE.WebGLRenderer;
  animations?: Array<AnimationRepresentation>;
  update?: (deltaTime: number, time: number) => void;
}

export class SceneController {
  animationIndex = 0;
  deltaTime = 0;
  elapsedTime = 0;
  firstFrame = true;
  paused = true;
  fps = 60;
  timePrecision = 1e5;
  startTime = 0;
  endTime = Infinity;
  loopAnimations: Array<Animation> = [];
  finishedAnimationCount = 0;
  userScene: StudioScene;
  three = THREE;
  viewport: THREE.Vector4;
  aspectRatio: number;

  constructor(
    public UserScene: Class<StudioScene>,
    canvasRef: HTMLCanvasElement,
    config: (WidthSetupConfig | HeightSetupConfig) & {
      viewport?: THREE.Vector4;
    },
  ) {
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
      this.userScene.renderer.render(
        this.userScene.scene,
        this.userScene.camera,
      );
    } else {
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

  tick(deltaTime: number, render = true) {
    if (this.firstFrame) {
      this.deltaTime = 0;
      this.elapsedTime = 0;
      this.firstFrame = false;
      let currentEndTime = 0;
      this.userScene.animations &&
        this.userScene.animations.forEach((o) => {
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
      this.userScene.update &&
        this.userScene.update(this.deltaTime, this.elapsedTime);
      const roundedTime =
        Math.round(this.elapsedTime * this.timePrecision) / this.timePrecision;
      this.loopAnimations.forEach((animation) => animation.update(roundedTime));
    } catch (err: any) {
      throw new Error(`Error executing user animation: ${err.toString()}`);
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
    this.paused = false;
    this.userScene.renderer.setAnimationLoop((initialTime) => {
      let lastTime = initialTime;
      this.userScene.renderer.setAnimationLoop((time) => {
        const elapsedSinceLastFrame = (time - lastTime) / 1000;
        const lastFrameToEndInterval = this.endTime - this.elapsedTime;
        if (elapsedSinceLastFrame < lastFrameToEndInterval) {
          this.tick(elapsedSinceLastFrame);
          lastTime = time;
        } else {
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
      if (
        child instanceof THREE.BufferGeometry ||
        child instanceof THREE.Material
      ) {
        child.dispose();
      } else if (
        !(
          child instanceof THREE.Scene ||
          child instanceof THREE.Group ||
          child instanceof THREE.Mesh
        )
      ) {
        console.warn("Can't dispose of object:", child);
      }
    });
    this.userScene.scene.clear();
  }
}
