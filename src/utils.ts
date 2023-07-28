import * as THREE from "three";
import { PIXELS_TO_COORDS } from "./constants";
import * as Geometry from "./geometry";

const BUFFER = 0.5;
const RIGHT = new THREE.Vector3(1, 0, 0);
const LEFT = new THREE.Vector3(-1, 0, 0);
const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);
const OUT = new THREE.Vector3(0, 0, 1);
const IN = new THREE.Vector3(0, 0, -1);

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
  moveNextTo(object1, object2, RIGHT, distance);
};

const moveToLeftOf = (object1, object2, distance = 0.5) => {
  moveNextTo(object1, object2, LEFT, distance);
};

const moveBelow = (object1, object2, distance = 0.5) => {
  moveNextTo(object1, object2, DOWN, distance);
};

const furthestInDirection = (object, direction) => {
  object.updateWorldMatrix(true, true);
  let maxPoint = new THREE.Vector3();
  let maxVal = -Infinity;
  let worldPoint = new THREE.Vector3();
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const positionArray = child.geometry.attributes.position.array;
      if (positionArray.length % 3 !== 0) {
        throw new Error("Invalid position array length");
      }
      for (let i = 0; i < positionArray.length; i += 3) {
        worldPoint
          .set(positionArray[i], positionArray[i + 1], positionArray[i + 2])
          .applyMatrix4(child.matrixWorld);
        let dot = worldPoint.dot(direction);
        if (dot > maxVal) {
          maxPoint.copy(worldPoint);
          maxVal = dot;
        }
      }
      if (child.parent.constructor.name === "Line") {
        const nextArray = child.geometry.attributes.nextPosition.array;
        worldPoint
          .set(nextArray.at(-3), nextArray.at(-2), nextArray.at(-1))
          .applyMatrix4(child.matrixWorld);
        let dot = worldPoint.dot(direction);
        if (dot > maxVal) {
          maxPoint.copy(worldPoint);
          maxVal = dot;
        }
      }
    }
  });
  return maxPoint;
};

const getCenter = (object) => {
  object.updateWorldMatrix(true, true);
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  let point = new THREE.Vector3();
  let worldPoint = new THREE.Vector3();
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const positionArray = child.geometry.attributes.position.array;
      if (positionArray.length % 3 !== 0) {
        throw new Error("Invalid position array length");
      }
      for (let i = 0; i < positionArray.length; i += 3) {
        point.set(positionArray[i], positionArray[i + 1], positionArray[i + 2]);
        worldPoint.copy(point).applyMatrix4(child.matrixWorld);
        min.min(worldPoint);
        max.max(worldPoint);
      }
      if (child.parent.constructor.name === "Line") {
        const nextArray = child.geometry.attributes.nextPosition.array;
        point.set(nextArray.at(-3), nextArray.at(-2), nextArray.at(-1));
        worldPoint.copy(point).applyMatrix4(child.matrixWorld);
        min.min(worldPoint);
        max.max(worldPoint);
      }
    }
  });
  worldPoint.addVectors(min, max).divideScalar(2);
  return worldPoint.addVectors(min, max).divideScalar(2);
};

const moveNextTo = (object1, object2, direction, distance = 0.5) => {
  const normalizedDirection = direction.clone().normalize();
  const obj1Edge = furthestInDirection(object1, normalizedDirection);
  const obj2Opposite = furthestInDirection(
    object2,
    new THREE.Vector3().copy(normalizedDirection).negate()
  );

  const obj1Center = getCenter(object1);
  const obj1Offset = new THREE.Vector3()
    .subVectors(obj1Edge, obj1Center)
    .projectOnVector(normalizedDirection);

  const obj2Center = getCenter(object2);
  const obj2Offset = new THREE.Vector3()
    .subVectors(obj2Center, obj2Opposite)
    .projectOnVector(normalizedDirection);

  const newPosition = new THREE.Vector3()
    .copy(obj1Center)
    .add(obj1Offset)
    .add(obj2Offset)
    .add(normalizedDirection.multiplyScalar(distance));
  object2.position.copy(newPosition);
};

export {
  getFrameAttributes,
  setupCanvas,
  clamp,
  moveToRightOf,
  moveToLeftOf,
  moveBelow,
  moveNextTo,
  BUFFER,
  RIGHT,
  LEFT,
  UP,
  DOWN,
  OUT,
  IN,
};
