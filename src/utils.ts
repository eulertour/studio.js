import * as THREE from "three";
import { PIXELS_TO_COORDS } from "./constants";
import * as Geometry from "./geometry";

const BUFFER = 0.5;
const RIGHT = new THREE.Vector3(1, 0, 0);
const LEFT = new THREE.Vector3(-1, 0, 0);
const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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
  renderer.setSize(rendererConfig.width, rendererConfig.height, false);
  renderer.getSize(Geometry.GeometryResolution);

  return [camera, renderer];
};

const moveToRightOf = (object1, object2, distance = 0.5) => {
  const object2Size = new THREE.Vector3();
  const object1Box = new THREE.Box3().setFromObject(object1);
  const object2Box = new THREE.Box3().setFromObject(object2);
  object2Box.getSize(object2Size);

  object2.position.x = object1Box.max.x + object2Size.x / 2 + distance;
};

export {
  getFrameAttributes,
  setupCanvas,
  clamp,
  moveToRightOf,
  BUFFER,
  RIGHT,
  LEFT,
  UP,
  DOWN,
};
