import * as THREE from "three";
import { Animation } from "./animation";
import * as Geometry from "./geometry";

export default class Scene {
  animations: Array<Animation> = [];
  currentAnimationIndex = 0;
  deltaTime = 0;
  elapsedTime = 0;
  firstFrame: boolean = true;

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
    this.firstFrame = true;
  }

  handleAnimations(deltaTime) {
    if (this.currentAnimationIndex >= this.animations.length) {
      return;
    }

    let currentAnimation = this.animations[this.currentAnimationIndex];
    currentAnimation.update(deltaTime);
    if (!currentAnimation.finished) {
      return;
    }

    this.currentAnimationIndex += 1;
    if (this.currentAnimationIndex >= this.animations.length) {
      return;
    }

    let nextAnimation = this.animations[this.currentAnimationIndex];
    nextAnimation.update(currentAnimation.excessTime);
  }

  tick(deltaTime: number) {
    if (this.firstFrame) {
      this.deltaTime = 0;
      this.elapsedTime = 0;
      this.firstFrame = false;
    } else {
      this.deltaTime = deltaTime;
      this.elapsedTime += deltaTime;
    }

    try {
      this.render(this.elapsedTime, this.deltaTime);
      this.handleAnimations(this.deltaTime);
    } catch (err) {
      console.error("Error executing user animation: ", err);
      this.renderer.setAnimationLoop(null);
    }
  }
}
