import * as THREE from "three";
import { Animation } from "./animation";
import * as Geometry from "./geometry";
import { handleAnimations, updateRenderData } from "./utils";

export default class Scene {
  animations: Array<Animation> = [];
  previousCallTime: number | null = null;
  startTime: number | null = null;
  currentAnimationIndex = 0;
  deltaTime = 0;
  elapsedTime = 0;
  paused = false;
  pausedTime = 0;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.WebGLRenderer
  ) {
    scene.clear();
    renderer.getSize(Geometry.GeometryResolution);
  }

  render(time: number, deltaTime: number) {}

  reset() {
    this.previousCallTime = null;
    this.startTime = null;
    this.currentAnimationIndex = 0;
    this.deltaTime = 0;
    this.elapsedTime = 0;
  }

  tick(time: number) {
    [
      this.startTime,
      this.deltaTime,
      this.elapsedTime,
      this.previousCallTime,
      this.pausedTime,
    ] = updateRenderData(
      this.startTime,
      this.previousCallTime,
      time,
      this.pausedTime,
      this.paused
    );

    if (this.paused) return;
    try {
      this.render(this.elapsedTime, this.deltaTime);
      this.currentAnimationIndex = handleAnimations(
        this.animations,
        this.currentAnimationIndex,
        this.deltaTime
      );
    } catch (err) {
      console.error("Error executing user animation: ", err);
      this.renderer.setAnimationLoop(null);
    }
  }

  pause() {
    this.paused = true;
  }

  play() {
    this.paused = false;
  }
}
