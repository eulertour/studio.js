import * as THREE from "three";
import { Animation } from "./animation";
import * as Geometry from "./geometry";
import { handleAnimations, nextFrame, updateRenderData } from "./utils";

export default class Scene {
  animations: Array<Animation> = [];
  previousCallTime: number | null = null;
  startTime: number | null = null;
  currentAnimationIndex = 0;
  deltaTime = 0;
  elapsedTime = 0;
  // TODO: FPS from hardware info
  static FPS = 60;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.WebGLRenderer
  ) {
    scene.clear();
    renderer.getSize(Geometry.GeometryResolution);
  }

  render(time: number, deltaTime: number) {}

  init(scene, camera, renderer) {}

  reset() {
    this.previousCallTime = null;
    this.startTime = null;
    this.currentAnimationIndex = 0;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.animations.forEach((animation) => animation.reset());
    this.scene.children.forEach((child) => {
      if (child.dispose !== undefined) {
        child.dispose();
      } else {
        console.warn("Can't dispose of object:", child);
      }
    });
    this.scene.clear();
    this.init(this.scene, this.camera, this.renderer);
  }

  renderAndHandleAnimations(elapsedTime, deltaTime) {
    this.render(elapsedTime, deltaTime);
    this.currentAnimationIndex = handleAnimations(
      this.animations,
      this.currentAnimationIndex,
      deltaTime
    );
  }

  tick(time: number) {
    [this.startTime, this.deltaTime, this.elapsedTime, this.previousCallTime] =
      updateRenderData(this.startTime, this.previousCallTime, time);

    try {
      this.renderAndHandleAnimations(this.elapsedTime, this.deltaTime);
    } catch (err) {
      console.error("Error executing user animation: ", err);
      this.renderer.setAnimationLoop(null);
    }
  }
}
