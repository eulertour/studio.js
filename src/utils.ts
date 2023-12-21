import * as THREE from "three";
import { DEFAULT_BACKGROUND_HEX, PIXELS_TO_COORDS } from "./constants";
import * as Geometry from "./geometry";
import { Style } from "./geometry.types";
import { Camera } from "build/three-types";
import { CameraDimensions, setCameraDimensions } from "./MeshLine/MeshLineMaterial";

const BUFFER = 0.5;
const RIGHT = Object.freeze(new THREE.Vector3(1, 0, 0));
const LEFT = Object.freeze(new THREE.Vector3(-1, 0, 0));
const UP = Object.freeze(new THREE.Vector3(0, 1, 0));
const DOWN = Object.freeze(new THREE.Vector3(0, -1, 0));
const OUT = Object.freeze(new THREE.Vector3(0, 0, 1));
const IN = Object.freeze(new THREE.Vector3(0, 0, -1));

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

export interface WidthSetupConfig {
  aspectRatio: number;
  pixelWidth: number;
  coordinateWidth: number;
}

const isWidthSetup = (config: object): config is WidthSetupConfig => {
  return (
    "aspectRatio" in config &&
    "pixelWidth" in config &&
    "coordinateWidth" in config
  );
};

export interface HeightSetupConfig {
  aspectRatio: number;
  pixelHeight: number;
  coordinateHeight: number;
}

const isHeightSetup = (config: object): config is HeightSetupConfig => {
  return (
    "aspectRatio" in config &&
    "pixelHeight" in config &&
    "coordinateHeight" in config
  );
};

const setupCanvas = (
  canvas: HTMLCanvasElement,
  config: (WidthSetupConfig | HeightSetupConfig)
    & { viewport?: THREE.Vector4 } = {
    aspectRatio: 16 / 9,
    pixelHeight: 720,
    coordinateHeight: 8,
    viewport: undefined,
  }
): [THREE.Scene, THREE.Camera, THREE.WebGLRenderer] => {
  config = Object.assign(
    {
      aspectRatio: 16 / 9,
      pixelHeight: 720,
      coordinateHeight: 8,
      viewport: undefined,
    },
    config,
  );
  let aspectRatio, pixelWidth, pixelHeight, coordinateWidth, coordinateHeight;
  if (isWidthSetup(config)) {
    aspectRatio = config.aspectRatio;
    pixelWidth = config.pixelWidth;
    coordinateWidth = config.coordinateWidth;
    pixelHeight = pixelWidth / aspectRatio;
    coordinateHeight = coordinateWidth / aspectRatio;
  } else if (isHeightSetup(config)) {
    aspectRatio = config.aspectRatio;
    pixelHeight = config.pixelHeight;
    coordinateHeight = config.coordinateHeight;
    pixelWidth = pixelHeight * aspectRatio;
    coordinateWidth = coordinateHeight * aspectRatio;
  } else {
    throw new Error("Invalid config:", config);
  }

  const camera = new THREE.OrthographicCamera(
    -coordinateWidth / 2,
    coordinateWidth / 2,
    coordinateHeight / 2,
    -coordinateHeight / 2,
    1,
    11
  );
  camera.position.z = 6;
  setCameraDimensions(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(new THREE.Color(DEFAULT_BACKGROUND_HEX));
  renderer.autoClear = false;
  if (config.viewport) {
    Geometry.CanvasViewport.copy(config.viewport);
  } else {
    renderer.setSize(pixelWidth, pixelHeight, false);
    Geometry.CanvasViewport.set(0, 0, pixelWidth, pixelHeight);
  }
  if (typeof window !== "undefined") {
    renderer.setPixelRatio(window.devicePixelRatio);
    Geometry.CanvasViewport.multiplyScalar(window.devicePixelRatio);
  }
  return [new THREE.Scene(), camera, renderer];
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
      if (child.geometry.attributes.nextPosition !== undefined) {
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

const moveNextTo = (target, object, direction, distance = 0.5) => {
  target.updateWorldMatrix(true, true);
  object.updateWorldMatrix(true, true);

  let targetCenter = new THREE.Vector3();
  let objectCenter = new THREE.Vector3();
  const targetBox = new THREE.Box3().expandByObject(target);
  const objectBox = new THREE.Box3().expandByObject(object);
  
  targetBox.getCenter(targetCenter);
  objectBox.getCenter(objectCenter);
  
  let objectWorldPosition = object.parent !== null
    ? object.parent.localToWorld(object.position.clone())
    : object.position.clone();
  const objectPositionToCenter = objectCenter.clone().sub(objectWorldPosition);

  let targetCenterToHorizontalEdge = 0;
  let objectCenterToHorizontalEdge = 0;
  if (direction.x > 0) {
    targetCenterToHorizontalEdge = targetBox.max.x - targetCenter.x;
    objectCenterToHorizontalEdge = objectBox.min.x - objectCenter.x;
  } else if (direction.x < 0) {
    targetCenterToHorizontalEdge = targetBox.min.x - targetCenter.x;
    objectCenterToHorizontalEdge = objectBox.max.x - objectCenter.x;
  }

  let targetCenterToVerticalEdge = 0;
  let objectCenterToVerticalEdge = 0;
  if (direction.y > 0) {
    targetCenterToVerticalEdge = targetBox.max.y - targetCenter.y;
    objectCenterToVerticalEdge = objectBox.min.y - objectCenter.y;
  } else if (direction.y < 0) {
    targetCenterToVerticalEdge = targetBox.min.y - targetCenter.y;
    objectCenterToVerticalEdge = objectBox.max.y - objectCenter.y;
  }
  
  const finalObjectPosition = new THREE.Vector3()
    .copy(targetCenter)
    .addScaledVector(direction, distance)
    .sub(objectPositionToCenter);
  finalObjectPosition.x += targetCenterToHorizontalEdge;
  finalObjectPosition.x -= objectCenterToHorizontalEdge;
  finalObjectPosition.y += targetCenterToVerticalEdge;
  finalObjectPosition.y -= objectCenterToVerticalEdge;

  if (object.parent !== null) {
    object.position.copy(object.parent.worldToLocal(finalObjectPosition));
  } else {
    object.position.copy(finalObjectPosition);
  }
}

const moveToRightOf = (target, object, distance = 0.5) => {
  moveNextTo(target, object, RIGHT, distance);
};

const moveToLeftOf = (target, object, distance = 0.5) => {
  moveNextTo(target, object, LEFT, distance);
};

const moveAbove = (target, object, distance = 0.5) => {
  moveNextTo(target, object, UP, distance);
};

const moveBelow = (target, object, distance = 0.5) => {
  moveNextTo(target, object, DOWN, distance);
};

const getBoundingBoxCenter = (obj: THREE.Object3D, target: THREE.Vector3) => {
  obj.updateWorldMatrix(true, true);
  new THREE.Box3().expandByObject(obj).getCenter(target);
  return target;
};

const getBoundingBoxHelper = (obj: THREE.Object3D, color: string) => {
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().expandByObject(obj);
  const helper = new THREE.Box3Helper(box, new THREE.Color(color));
  return helper;
};

const transformBetweenSpaces = (
  from: THREE.Object3D,
  to: THREE.Object3D,
  point: THREE.Vector3,
) => {
  return to.worldToLocal(from.localToWorld(point));
}

/*
 * Solves
 * [ a b ]   [ xa ]   [ ba ]
 * [ c d ] * [ xb ] = [ bb ]
 * for x.
 */
const matrixSolve = (
  ma: number,
  mb: number,
  mc: number,
  md: number,
  ba: number,
  bb: number
): [number, number] | null => {
  const determinant = ma * md - mb * mc;
  if (determinant === 0) {
    return null;
  }
  return [(md * ba - mb * bb) / determinant, (ma * bb - mc * ba) / determinant];
};

// https://blogs.sas.com/content/iml/2018/07/09/intersection-line-segments.html
const getIntersection = (
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  q1: THREE.Vector3,
  q2: THREE.Vector3
) => {
  const p2MinusP1 = new THREE.Vector3().subVectors(p2, p1);
  const q1MinusQ2 = new THREE.Vector3().subVectors(q1, q2);
  const q1MinusP1 = new THREE.Vector3().subVectors(q1, p1);
  const solution = matrixSolve(
    p2MinusP1.x,
    q1MinusQ2.x,
    p2MinusP1.y,
    q1MinusQ2.y,
    q1MinusP1.x,
    q1MinusP1.y
  );
  if (solution === null) {
    // TODO: Handle parallel lines.
    return null;
  }

  const [s, t] = solution;
  if (s < 0 || 1 < s || t < 0 || 1 < t) {
    return null;
  }

  return p1.multiplyScalar(1 - s).addScaledVector(p2, s);
};

const shapeIsClosed = (shape, adjacentThreshold = 0.0001) => {
  return (
    new THREE.Vector3()
      .subVectors(shape.points.at(0), shape.points.at(-1))
      .length() < adjacentThreshold
  );
};

const intersectionsBetween = (
  shape1: Geometry.Shape,
  shape2: Geometry.Shape
): Array<THREE.Vector3> => {
  let intersections: Array<THREE.Vector3> = [];
  shape1.updateMatrixWorld();
  shape2.updateMatrixWorld();
  for (let i = 0; i < shape1.points.length - 1; i++) {
    const segment1 = new THREE.Line3(
      shape1.points[i]?.clone().applyMatrix4(shape1.matrixWorld),
      shape1.points[i + 1]?.clone().applyMatrix4(shape1.matrixWorld)
    );
    for (let j = 0; j < shape2.points.length - 1; j++) {
      const segment2 = new THREE.Line3(
        shape2.points[j]?.clone().applyMatrix4(shape2.matrixWorld),
        shape2.points[j + 1]?.clone().applyMatrix4(shape2.matrixWorld)
      );
      const maybeIntersection = getIntersection(
        segment1.start,
        segment1.end,
        segment2.start,
        segment2.end
      );
      if (maybeIntersection !== null) {
        intersections.push(maybeIntersection);
      }
    }
  }
  return intersections;
};

class ShapeFromCurves {
  adjacentThreshold = 0.0001;
  segmentClosestToPoint = new THREE.Vector3();
  pointToSegment = new THREE.Vector3();
  points: Array<THREE.Vector3>;
  style: Style = {};

  withStyle(style: Style) {
    this.style = style;
    return this;
  }

  startAt(start: THREE.Vector3) {
    this.points = [start];
    return this;
  }

  extendAlong(
    shape: Geometry.Shape,
    direction: THREE.Vector3,
    until?: THREE.Vector3 | undefined
  ) {
    const startPoint = this.points.at(-1)?.clone();
    if (startPoint === undefined) {
      throw new Error("Cannot extend with no current points.");
    }

    // Find where the shape intersects the current endpoint.
    let intersectSegment = null;
    let intersectIndex = null;
    shape.updateMatrixWorld();
    for (let j = 0; j < shape.points.length - 1; j++) {
      const segment = new THREE.Line3(
        shape.points.at(j)?.clone().applyMatrix4(shape.matrixWorld),
        shape.points
          .at(j + 1)
          ?.clone()
          .applyMatrix4(shape.matrixWorld)
      );
      segment.closestPointToPoint(startPoint, true, this.segmentClosestToPoint);
      const distanceToSegment = this.pointToSegment
        .subVectors(this.segmentClosestToPoint, startPoint)
        .length();
      if (distanceToSegment < this.adjacentThreshold) {
        intersectSegment = segment;
        intersectIndex = j;
        break;
      }
    }
    if (intersectSegment === null || intersectIndex === null) {
      throw new Error(
        `No intersection between ${startPoint.toArray()} and ${shape}`
      );
    }

    const vectorFromPointToIndex = (point: THREE.Vector3, index: number) => {
      let endPoint = shape.points
        .at(index)
        ?.clone()
        .applyMatrix4(shape.matrixWorld);
      if (endPoint === undefined) {
        return new THREE.Vector3();
      }
      return new THREE.Vector3().subVectors(endPoint, point).normalize();
    };

    // Get potential directions to extend.
    let towardStartVector: THREE.Vector3;
    let forwardInitialPointIndex = intersectIndex + 1;
    let backwardInitialPointIndex = intersectIndex;

    // debugger;
    towardStartVector = new THREE.Vector3().subVectors(
      intersectSegment.start,
      this.segmentClosestToPoint
    );
    if (towardStartVector.length() < this.adjacentThreshold) {
      // The point intersects at the start of this segment, so try using the previous point instead.
      let prevIndex = intersectIndex - 1;
      if (prevIndex === -1 && shapeIsClosed(shape)) {
        // The point intersects at the first point of a closed shape, so use the second to last point.
        prevIndex = shape.points.length - 2;
      }
      if (prevIndex !== -1) {
        towardStartVector = vectorFromPointToIndex(
          intersectSegment.start,
          prevIndex
        );
        forwardInitialPointIndex = intersectIndex + 1;
        backwardInitialPointIndex = prevIndex;
      } else {
        // The vector is (effectively) zero.
        towardStartVector.set(0, 0, 0);
      }
    }
    towardStartVector.normalize();

    // Ugh do this.
    let towardEndVector: THREE.Vector3;
    const endToIntersection = new THREE.Vector3()
      .subVectors(intersectSegment.end, this.segmentClosestToPoint)
      .length();
    if (
      endToIntersection < this.adjacentThreshold &&
      intersectIndex + 2 < shape.points.length
    ) {
      let nextPoint = shape.points
        .at(intersectIndex + 2)
        ?.clone()
        .applyMatrix4(shape.matrixWorld);
      if (nextPoint === undefined) {
        throw new Error("No next point");
      }
      towardEndVector = new THREE.Vector3()
        .subVectors(nextPoint, intersectSegment.end)
        .normalize();
      // Handle closed curves (shape.points.at(0) === shape.points.at(-1))
      if (towardEndVector.length() < this.adjacentThreshold) {
        nextPoint = shape.points
          .at(intersectIndex + 3)
          ?.clone()
          .applyMatrix4(shape.matrixWorld);
        if (nextPoint === undefined) {
          throw new Error("No next point");
        }
      }

      forwardInitialPointIndex = intersectIndex + 2;
      backwardInitialPointIndex = intersectIndex;
    } else {
      towardEndVector = new THREE.Vector3()
        .subVectors(intersectSegment.end, this.segmentClosestToPoint)
        .normalize();
    }

    const forward =
      direction.dot(towardEndVector) > direction.dot(towardStartVector);
    this.extendCurve(
      shape,
      forward ? forwardInitialPointIndex : backwardInitialPointIndex,
      forward,
      until
    );
    return this;
  }

  extendCurve(
    shape: Geometry.Shape,
    initialPointIndex: number,
    forward: boolean,
    until?: THREE.Vector3 | undefined
  ) {
    const advance = (i: number) => {
      i += increment;
      if (i === shape.points.length && shapeIsClosed(shape)) {
        i = 1;
      } else if (i === -1 && shapeIsClosed(shape)) {
        i = shape.points.length - 2;
      }
      return i;
    };

    // const initialPointIndex = forward ? segmentIndex + 1 : segmentIndex;
    const increment = forward ? 1 : -1;

    let i = initialPointIndex;
    let count = 0;
    while (0 <= i && i < shape.points.length) {
      count += 1;
      if (count === 500) {
        console.log("rip");
        break;
      }
      const newPoint = shape.points
        .at(i)
        ?.clone()
        .applyMatrix4(shape.matrixWorld);
      if (newPoint === undefined) {
        throw new Error("Error extending curve.");
      }
      const newSegment = new THREE.Line3(this.points.at(-1)?.clone(), newPoint);
      if (newSegment.distance() < this.adjacentThreshold) {
        i += increment;
        continue;
      }
      let pointsToCheck = this.points.slice(0, this.points.length - 1);
      if (until !== undefined) {
        pointsToCheck.push(until);
      }
      for (let point of pointsToCheck) {
        newSegment.closestPointToPoint(point, true, this.segmentClosestToPoint);
        const distanceToSegment = this.pointToSegment
          .subVectors(this.segmentClosestToPoint, point)
          .length();
        if (distanceToSegment < this.adjacentThreshold) {
          this.points.push(point.clone());
          return;
        }
      }
      this.points.push(newPoint);

      i = advance(i);
    }
  }

  finish() {
    return new Geometry.Polygon(this.points, this.style);
  }
}

export {
  getFrameAttributes,
  setupCanvas,
  clamp,
  furthestInDirection,
  moveToRightOf,
  moveToLeftOf,
  moveAbove,
  moveBelow,
  moveNextTo,
  getBoundingBoxCenter,
  getBoundingBoxHelper,
  transformBetweenSpaces,
  intersectionsBetween,
  ShapeFromCurves,
  BUFFER,
  RIGHT,
  LEFT,
  UP,
  DOWN,
  OUT,
  IN,
};
