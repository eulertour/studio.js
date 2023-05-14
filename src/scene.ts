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
  paused = false;
  seeking = false;
  pausedTime = 0;
  seekOffset = 0;
  // TODO: FPS from hardware info
  static FPS = 60;
  pauseCallbacks: Array<(seeking: boolean) => void>;
  playCallbacks: Array<(seeking: boolean) => void>;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.WebGLRenderer
  ) {
    scene.clear();
    renderer.getSize(Geometry.GeometryResolution);
    this.pauseCallbacks = [];
    this.playCallbacks = [];
  }

  render(time: number, deltaTime: number) {}

  reset() {
    this.previousCallTime = null;
    this.startTime = null;
    this.currentAnimationIndex = 0;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.pausedTime = 0;
    this.seekOffset = 0;
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
      this.seekOffset,
      this.paused,
      this.seeking
    );

    if (this.paused && !this.seeking) return;

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

  seek(durationMs: number) {
    if (durationMs === 0)
      throw new Error("durationMs must be a non zero integer");
    this.seeking = true;

    const targetMs: number = this.elapsedTime + durationMs;

    if (durationMs < 0) this.reset();
    this.pause();
    if (targetMs <= 0) {
      this.seeking = false;
      return;
    }

    const start = performance.now();
    const MSPF = 1000 / Scene.FPS;
    const framesToRender = Math.ceil(
      (durationMs > 0 ? durationMs / 1000 : targetMs / 1000) * Scene.FPS
    );
    for (let i = 0; i <= framesToRender; i++) {
      this.tick(start + MSPF * i);
    }
    this.seekOffset += MSPF * framesToRender;
    this.play();
    nextFrame(() => this.pause());
    this.seeking = false;
  }

  pause() {
    this.paused = true;
    this.pauseCallbacks.forEach((cb) => cb(this.seeking));
  }

  play() {
    this.paused = false;
    this.playCallbacks.forEach((cb) => cb(this.seeking));
  }

  onPause(cb: () => void) {
    this.pauseCallbacks.push(cb);
  }

  onPlay(cb: () => void) {
    this.playCallbacks.push(cb);
  }
}
