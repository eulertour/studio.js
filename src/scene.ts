import * as THREE from "three";
import { Animation } from "./animation";
import * as Geometry from "./geometry";
import { clamp } from "./utils";

export default class Scene {
  animations: Array<Animation> = [];
  currentAnimationIndex = 0;
  deltaTime = 0;
  elapsedTime = 0;
  firstFrame = true;
  paused = true;
  fps = 60;
  startTime = 0;
  endTime = Infinity;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.WebGLRenderer,
    public signalUpdate = () => {}
  ) {
    scene.clear();
    const resolution = new THREE.Vector2();
    renderer.getSize(resolution);
    Geometry.GeometryResolution.copy(resolution);
  }

  loop(time: number, deltaTime: number) {}

  init(scene, camera, renderer) {}

  reset() {
    this.currentAnimationIndex = 0;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.animations.forEach((animation) => animation.reset());
    this.scene.traverse((child) => {
      if (child.dispose !== undefined) {
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

  tick(deltaTime: number, render = true) {
    if (this.firstFrame) {
      this.deltaTime = 0;
      this.elapsedTime = 0;
      this.firstFrame = false;
    } else {
      this.deltaTime = deltaTime;
      this.elapsedTime += deltaTime;
    }

    try {
      this.loop(this.elapsedTime, this.deltaTime);
      this.handleAnimations(this.deltaTime);
    } catch (err: any) {
      this.renderer.setAnimationLoop(null);
      throw new Error(`Error executing user animation: ${err.toString()}`);
    }

    if (render) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  play() {
    this.paused = false;
    this.renderer.setAnimationLoop((initialTime) => {
      let lastTime = initialTime;
      this.renderer.setAnimationLoop((time) => {
        const standardTickLength = (time - lastTime) / 1000;
        const endTimeTickLength = this.endTime - this.elapsedTime;
        if (standardTickLength < endTimeTickLength) {
          this.tick(standardTickLength);
          lastTime = time;
        } else {
          this.tick(endTimeTickLength);
          this.pause();
        }
        this.signalUpdate();
      });
    });
  }

  pause() {
    this.paused = true;
    this.renderer.setAnimationLoop(null);
    this.signalUpdate();
  }

  seek(duration: number) {
    if (duration === 0) return;
    this.seekAbsolute(
      clamp(this.elapsedTime + duration, this.startTime, this.endTime)
    );
  }

  seekAbsolute(target: number) {
    if (target < this.elapsedTime) {
      this.reset();
    }
    const spf = 1 / this.fps;
    while (this.elapsedTime !== target) {
      try {
        this.tick(Math.min(spf, target - this.elapsedTime), /*render=*/ false);
      } catch (e: any) {
        throw new Error(`Error advancing scene: ${e.toString()}`);
      }
    }
    this.renderer.render(this.scene, this.camera);
    this.signalUpdate();
  }
}
