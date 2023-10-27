import * as THREE from "three";
import { Animation } from "./animation";
import * as Geometry from "./geometry";

export default class Scene {
  animations: Array<Object> = [];
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

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.WebGLRenderer,
    public signalUpdate = () => {}
  ) {
    scene.clear();
    const resolution = new THREE.Vector2();
    renderer.getSize(resolution);
    if (typeof window !== "undefined") {
      resolution.multiplyScalar(window.devicePixelRatio);
    }
    Geometry.GeometryResolution.copy(resolution);
  }

  loop(time: number, deltaTime: number) {}

  init(scene, camera, renderer) {}

  dispose() {
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
  }

  tick(deltaTime: number, render = true) {
    if (this.firstFrame) {
      this.deltaTime = 0;
      this.elapsedTime = 0;
      this.firstFrame = false;
      let currentEndTime = 0;
      this.animations.forEach((o) => {
        if (Array.isArray(o)) {
          o = { animations: o };
        }
        if (o instanceof Animation) {
          const animation = o;
          animation.startTime = currentEndTime;
          animation.endTime = currentEndTime + animation.runTime;
          animation.parent = animation.parent || this.scene;
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
          animationArray.forEach((animation) => {
            animation.startTime = currentEndTime;
            animation.endTime = currentEndTime + runTime * scale;
            animation.runTime = runTime;
            animation.scale = scale;
            animation.parent = animation.parent || o.parent || this.scene;
            this.loopAnimations.push(...animationArray);
          });
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
      this.loop(this.elapsedTime, this.deltaTime);
      const roundedTime =
        Math.round(this.elapsedTime * this.timePrecision) / this.timePrecision;
      this.loopAnimations.forEach((animation) => animation.update(roundedTime));
    } catch (err: any) {
      this.renderer.setAnimationLoop(null);
      throw new Error(`Error executing user animation: ${err.toString()}`);
    }

    const newFinishedAnimationCount = this.loopAnimations.reduce(
      (acc, cur) => acc + (cur.finished ? 1 : 0),
      0
    );
    if (newFinishedAnimationCount !== this.finishedAnimationCount) {
      this.animationIndex += 1;
      this.finishedAnimationCount = newFinishedAnimationCount;
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

  seekForward(duration: number) {
    if (duration < 0)
      throw new Error("Scene.seekForward() requires a nonnegative offset");

    if (duration !== 0) {
      const target = THREE.MathUtils.clamp(
        this.elapsedTime + duration,
        this.startTime,
        this.endTime
      );
      const spf = 1 / this.fps;
      while (this.elapsedTime !== target) {
        try {
          this.tick(
            Math.min(spf, target - this.elapsedTime),
            /*render=*/ false
          );
        } catch (e: any) {
          throw new Error(`Error advancing scene: ${e.toString()}`);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.signalUpdate();
  }
}
