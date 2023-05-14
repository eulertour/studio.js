import * as THREE from "three";
import { PIXELS_TO_COORDS } from "./constants";
import * as Geometry from "./geometry";

const getFrameAttributes = (aspectRatio: number, height: number) => {
  const coordinateHeight = PIXELS_TO_COORDS * height;
  return {
    aspectRatio,
    height,
    width: height * aspectRatio,
    coordinateHeight,
    coordinateWidth: coordinateHeight * aspectRatio,
  };
};

const setupCanvas = (
  canvas: HTMLCanvasElement,
  verticalResolution = 720
): [THREE.Camera, THREE.WebGLRenderer] => {
  const frameConfig = getFrameAttributes(16 / 9, 450);
  const camera = new THREE.OrthographicCamera(
    (-PIXELS_TO_COORDS * frameConfig.width) / 2,
    (PIXELS_TO_COORDS * frameConfig.width) / 2,
    (PIXELS_TO_COORDS * frameConfig.height) / 2,
    (-PIXELS_TO_COORDS * frameConfig.height) / 2,
    1,
    11
  );
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(new THREE.Color(0xfffaf0));

  const rendererConfig = getFrameAttributes(16 / 9, verticalResolution);
  renderer.setSize(rendererConfig.width, rendererConfig.height);
  renderer.getSize(Geometry.GeometryResolution);

  return [camera, renderer];
};

const updateRenderData = (
  startTime: number | null,
  previousCallTime: number | null,
  time: number
) => {
  let deltaTime, elapsedTime;

  if (previousCallTime !== null && startTime !== null) {
    deltaTime = time - previousCallTime;
    elapsedTime = time - startTime;
    previousCallTime = time;
  } else {
    startTime = time;
    deltaTime = 0;
    elapsedTime = 0;
    previousCallTime = time;
  }

  return [startTime, deltaTime, elapsedTime, previousCallTime];
};

const handleAnimations = (animations, currentAnimationIndex, deltaTime) => {
  if (currentAnimationIndex >= animations.length) {
    return currentAnimationIndex;
  }

  let currentAnimation = animations[currentAnimationIndex];
  currentAnimation.update(deltaTime);
  if (!currentAnimation.finished) {
    return currentAnimationIndex;
  }

  currentAnimationIndex += 1;
  if (currentAnimationIndex >= animations.length) {
    return currentAnimationIndex;
  }

  let nextAnimation = animations[currentAnimationIndex];
  nextAnimation.update(currentAnimation.excessTime);
  return currentAnimationIndex;
};

const nextFrame = (cb: (time: DOMHighResTimeStamp) => void) =>
  requestAnimationFrame(() => requestAnimationFrame(cb));

export {
  getFrameAttributes,
  setupCanvas,
  updateRenderData,
  handleAnimations,
  nextFrame,
};
