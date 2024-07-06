import * as THREE from "three";
import { DEFAULT_BACKGROUND_HEX, PIXELS_TO_COORDS } from "./constants";
import * as Geometry from "./geometry";
import * as Text from "./text";
import { Style } from "./geometry.types";
// import { Camera } from "build/three-types";
import { setCameraDimensions } from "./MeshLine/MeshLineMaterial";
import { CanvasViewport } from "./MeshLine/MeshLineMaterial";
import { MeshLine } from "./MeshLine";

const BUFFER = 0.5;
const ORIGIN = Object.freeze(new THREE.Vector3(0, 0, 0));
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

export type WidthSetupConfig = {
  aspectRatio: number;
  pixelWidth: number;
  coordinateWidth: number;
};

const isWidthSetup = (config: object): config is WidthSetupConfig => {
  return (
    "aspectRatio" in config &&
    "pixelWidth" in config &&
    "coordinateWidth" in config
  );
};

export type HeightSetupConfig = {
  aspectRatio: number;
  pixelHeight: number;
  coordinateHeight: number;
};

const isHeightSetup = (config: object): config is HeightSetupConfig => {
  return (
    "aspectRatio" in config &&
    "pixelHeight" in config &&
    "coordinateHeight" in config
  );
};

const setupCanvas = (
  canvas: HTMLCanvasElement,
  config: (WidthSetupConfig | HeightSetupConfig) & {
    viewport?: THREE.Vector4;
  } = {
    aspectRatio: 16 / 9,
    pixelHeight: 720,
    coordinateHeight: 8,
    viewport: undefined,
  },
): [THREE.Scene, THREE.Camera, THREE.WebGLRenderer] => {
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
    11,
  );
  camera.position.z = 6;
  setCameraDimensions(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(new THREE.Color(DEFAULT_BACKGROUND_HEX));
  renderer.autoClear = false;
  if (config.viewport) {
    CanvasViewport.copy(config.viewport);
  } else {
    renderer.setSize(pixelWidth, pixelHeight, false);
    CanvasViewport.set(0, 0, pixelWidth, pixelHeight);
  }
  if (typeof window !== "undefined") {
    renderer.setPixelRatio(window.devicePixelRatio);
    CanvasViewport.multiplyScalar(window.devicePixelRatio);
  }
  return [new THREE.Scene(), camera, renderer];
};

const convertWorldDirectionToObjectSpace = (
  worldDirection: THREE.Vector3,
  object: THREE.Object3D,
): THREE.Vector3 => {
  const worldQuaternion = new THREE.Quaternion();
  object.getWorldQuaternion(worldQuaternion);

  const inverseQuaternion = worldQuaternion.clone().invert();

  const localDirection = worldDirection
    .clone()
    .applyQuaternion(inverseQuaternion);
  localDirection.normalize();

  return localDirection;
};

/*
 * Vertically stacks the children of a group.
 * buffer specifies the length of empty space between each child.
 */
const vstack = (group: THREE.Group, buffer = 0.2) => {
  if (group.children.length < 2) return group;

  const center = group.children[0].position.clone();
  for (let i = 1; i < group.children.length; i++) {
    group.children[i].position
      .copy(group.children[i - 1].position)
      .addScaledVector(DOWN, buffer);
    center.add(group.children[i].position);
  }
  center.divideScalar(group.children.length);

  group.children.forEach((child) => child.position.sub(center));
};

/*
 * Like vstack, but puts an equal distance between the positions of each child.
 */
const vspace = (group: THREE.Group, distanceBetween?: number) => {
  if (group.children.length < 2) return group;

  const defaultBuffer = 0.2;
  let defaultSpacing = -Infinity;
  for (let i = 1; i < group.children.length; i++) {
    const previous = group.children[i - 1];
    const previousLowest = furthestInDirection(previous, DOWN);
    const distanceToBottom = new THREE.Vector3()
      .subVectors(previousLowest, previous.position)
      .dot(DOWN);

    const current = group.children[i];
    const currentTop = furthestInDirection(current, UP);
    const distanceToTop = new THREE.Vector3()
      .subVectors(currentTop, current.position)
      .dot(UP);

    defaultSpacing = Math.max(
      defaultSpacing,
      distanceToBottom + distanceToTop + defaultBuffer,
    );
  }

  const center = group.children[0].position.clone();
  for (let i = 1; i < group.children.length; i++) {
    const previous = group.children[i - 1];
    const current = group.children[i];
    current.position
      .copy(previous.position)
      .addScaledVector(DOWN, distanceBetween ?? defaultSpacing);
    center.add(group.children[i].position);
  }
  center.divideScalar(group.children.length);

  group.children.forEach((child) => child.position.sub(center));
};

const transformBetweenSpaces = (
  from: THREE.Object3D,
  to: THREE.Object3D,
  point: THREE.Vector3,
) => {
  return to.worldToLocal(from.localToWorld(point));
};

const furthestInDirection = (
  object,
  direction,
  exclude: THREE.Object3D | Array<THREE.Object3D> = [],
) => {
  let excludeArray: Array<THREE.Object3D>;
  if (!Array.isArray(exclude)) {
    excludeArray = [exclude];
  } else {
    excludeArray = exclude;
  }

  object.updateWorldMatrix(true, true);

  // const unitDirection = convertWorldDirectionToObjectSpace(direction, object);
  const unitDirection = direction.clone().normalize();

  let maxDot = -Infinity;
  let maxDotPoint = unitDirection.clone().negate().setLength(Infinity);
  object.traverse((obj) => {
    let exclusionCheckObj = obj;
    while (exclusionCheckObj) {
      if (excludeArray.includes(exclusionCheckObj)) {
        return;
      } else if (exclusionCheckObj === object) {
        break;
      }
      exclusionCheckObj = exclusionCheckObj.parent;
    }

    if (obj instanceof MeshLine) {
      for (const point of obj.points) {
        const clonedPoint = point.clone();
        transformBetweenSpaces(obj, object, clonedPoint);
        const dotProduct = clonedPoint.dot(unitDirection);
        if (dotProduct > maxDot) {
          maxDot = dotProduct;
          maxDotPoint.copy(clonedPoint);
        }
      }
    } else if (
      obj instanceof THREE.Mesh &&
      obj.parent?.parent?.parent instanceof Text.Text
    ) {
      const pointsArray = obj.geometry.attributes.position.array;
      const pointContainer = new THREE.Vector3();
      for (let i = 0; i < pointsArray.length; i += 3) {
        pointContainer.set(
          pointsArray[i],
          pointsArray[i + 1],
          pointsArray[i + 2],
        );
        transformBetweenSpaces(obj, object, pointContainer);
        const dotProduct = pointContainer.dot(unitDirection);
        if (dotProduct > maxDot) {
          maxDot = dotProduct;
          maxDotPoint.copy(pointContainer);
        }
      }
    }
  });

  return maxDotPoint;
};

const moveNextTo = (
  target: THREE.Object3D,
  object: THREE.Object3D,
  direction: THREE.Vector3,
  buffer = 0.2,
) => {
  target.updateWorldMatrix(true, true);
  object.updateWorldMatrix(true, true);

  const targetSpaceDirectionInitial = new THREE.Vector3().applyMatrix4(
    new THREE.Matrix4().copy(target.matrixWorld).invert(),
  );
  const targetSpaceDirectionFinal = direction
    .clone()
    .applyMatrix4(new THREE.Matrix4().copy(target.matrixWorld).invert());
  const targetSpaceDirection = new THREE.Vector3().subVectors(
    targetSpaceDirectionFinal,
    targetSpaceDirectionInitial,
  );

  // Target space
  let targetSpaceStartPosition;
  let targetSpaceOffsetInitial;
  let targetSpaceOffsetFinal;
  if (!(target instanceof Geometry.Line)) {
    const targetSpaceFurthestInDirection = furthestInDirection(
      target,
      targetSpaceDirection,
      object,
    );

    targetSpaceStartPosition = new THREE.Vector3();
    targetSpaceOffsetInitial = new THREE.Vector3();
    const targetSpaceOffsetFinalLength = targetSpaceDirection
      .clone()
      .normalize()
      .dot(targetSpaceFurthestInDirection);
    targetSpaceOffsetFinal = targetSpaceDirection
      .clone()
      .setLength(Math.max(targetSpaceOffsetFinalLength, 0));
  } else {
    const vector = target.getVector().normalize();
    const normal = vector.clone().applyAxisAngle(OUT, Math.PI / 2);
    const vectorDot = targetSpaceDirection.dot(vector);
    const normalDot = targetSpaceDirection.dot(normal);
    const againstVectorDot = targetSpaceDirection.dot(vector.clone().negate());
    const againstNormalDot = targetSpaceDirection.dot(normal.clone().negate());
    const dotProducts = [
      vectorDot,
      normalDot,
      againstVectorDot,
      againstNormalDot,
    ];
    const maxDot = Math.max(...dotProducts);
    if (maxDot === vectorDot) {
      targetSpaceStartPosition = target.end.clone();
    } else if (maxDot === againstVectorDot) {
      targetSpaceStartPosition = target.start.clone();
    } else if ([normalDot, againstNormalDot].includes(maxDot)) {
      targetSpaceStartPosition = new THREE.Vector3()
        .addVectors(target.start, target.end)
        .divideScalar(2);
    }
    targetSpaceOffsetInitial = new THREE.Vector3();
    targetSpaceOffsetFinal = new THREE.Vector3();
  }

  // Object space
  const objectSpaceDirectionInitial = new THREE.Vector3().applyMatrix4(
    new THREE.Matrix4().copy(object.matrixWorld).invert(),
  );
  const objectSpaceDirectionFinal = direction
    .clone()
    .applyMatrix4(new THREE.Matrix4().copy(object.matrixWorld).invert());
  const objectSpaceDirection = new THREE.Vector3()
    .subVectors(objectSpaceDirectionFinal, objectSpaceDirectionInitial)
    .negate();
  const objectSpaceFurthestInDirection = furthestInDirection(
    object,
    objectSpaceDirection,
    target,
  );

  let objectSpaceOffsetInitial = new THREE.Vector3();
  const objectSpaceOffsetFinalLength = objectSpaceDirection
    .clone()
    .normalize()
    .dot(objectSpaceFurthestInDirection);
  const objectSpaceOffsetFinal = objectSpaceDirection
    .clone()
    .negate()
    .setLength(Math.max(objectSpaceOffsetFinalLength, 0));

  // World space
  const worldSpaceStartPosition = targetSpaceStartPosition.applyMatrix4(
    target.matrixWorld,
  );
  const worldSpaceTargetOffsetInitial = targetSpaceOffsetInitial.applyMatrix4(
    target.matrixWorld,
  );
  const worldSpaceTargetOffsetFinal = targetSpaceOffsetFinal.applyMatrix4(
    target.matrixWorld,
  );
  const worldSpaceTargetOffset = new THREE.Vector3().subVectors(
    worldSpaceTargetOffsetFinal,
    worldSpaceTargetOffsetInitial,
  );

  const worldSpaceObjectOffsetInitial = objectSpaceOffsetInitial.applyMatrix4(
    object.matrixWorld,
  );
  const worldSpaceObjectOffsetFinal = objectSpaceOffsetFinal.applyMatrix4(
    object.matrixWorld,
  );
  const worldSpaceObjectOffset = new THREE.Vector3().subVectors(
    worldSpaceObjectOffsetFinal,
    worldSpaceObjectOffsetInitial,
  );

  const worldSpaceOffset = direction
    .clone()
    .setLength(
      0 +
        worldSpaceTargetOffset.length() +
        buffer +
        worldSpaceObjectOffset.length(),
    );
  const worldSpaceOffsetInitial = new THREE.Vector3();
  const worldSpaceOffsetFinal = worldSpaceOffset.clone();

  // Object parent space
  const objectParentSpaceStartPosition = worldSpaceStartPosition
    .applyMatrix4(object.matrixWorld.clone().invert())
    .applyMatrix4(object.matrix);
  const objectParentSpaceOffsetInitial = worldSpaceOffsetInitial
    .applyMatrix4(object.matrixWorld.clone().invert())
    .applyMatrix4(object.matrix);
  const objectParentSpaceOffsetFinal = worldSpaceOffsetFinal
    .applyMatrix4(object.matrixWorld.clone().invert())
    .applyMatrix4(object.matrix);
  const objectParentSpaceOffset = new THREE.Vector3().subVectors(
    objectParentSpaceOffsetFinal,
    objectParentSpaceOffsetInitial,
  );

  object.position
    .copy(objectParentSpaceStartPosition)
    .add(objectParentSpaceOffset);
  return object;
};

const moveToRightOf = (target, object, distance = 0.2) => {
  return moveNextTo(target, object, RIGHT, distance);
};

const moveToLeftOf = (target, object, distance = 0.2) => {
  return moveNextTo(target, object, LEFT, distance);
};

const moveAbove = (target, object, distance = 0.2) => {
  return moveNextTo(target, object, UP, distance);
};

const moveBelow = (target, object, distance = 0.2) => {
  return moveNextTo(target, object, DOWN, distance);
};

const rotate90 = (v: THREE.Vector3) => v.applyAxisAngle(OUT, Math.PI / 2);
const rotate180 = (v: THREE.Vector3) => v.applyAxisAngle(OUT, Math.PI);
const rotate270 = (v: THREE.Vector3) => v.applyAxisAngle(OUT, -Math.PI / 2);

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

const pointAlongCurve = (shape: Geometry.Shape, t: number) => {
  if (t < 0 || t > 1) {
    throw new Error(`Invalid parameter ${t}`);
  }

  const totalLength = strokeLength(shape);
  const targetLength = totalLength * t;

  let currentLength = 0;
  for (let i = 0; i < shape.points.length - 1; i++) {
    const segmentLength = getSegmentLength(
      shape.points[i],
      shape.points[i + 1],
    );
    if (currentLength + segmentLength >= targetLength) {
      const segmentPercent = (targetLength - currentLength) / segmentLength;
      return new THREE.Vector3().lerpVectors(
        shape.points[i],
        shape.points[i + 1],
        segmentPercent,
      );
    }
    currentLength += segmentLength;
  }

  return shape.points[shape.points.length - 1];
};

const strokeLength = (shape: Geometry.Shape) => {
  let length = 0;
  for (let i = 0; i < shape.points.length - 1; i++) {
    length += getSegmentLength(shape.points[i], shape.points[i + 1]);
  }
  return length;
};

const getSegmentLength = (u: THREE.Vector3, v: THREE.Vector3) => {
  const dx = u.x - v.x;
  const dy = u.y - v.y;
  const dz = u.z - v.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

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
  bb: number,
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
  q2: THREE.Vector3,
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
    q1MinusP1.y,
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
  shape2: Geometry.Shape,
): Array<THREE.Vector3> => {
  let intersections: Array<THREE.Vector3> = [];
  shape1.updateMatrixWorld();
  shape2.updateMatrixWorld();
  for (let i = 0; i < shape1.points.length - 1; i++) {
    const segment1 = new THREE.Line3(
      shape1.points[i]?.clone().applyMatrix4(shape1.matrixWorld),
      shape1.points[i + 1]?.clone().applyMatrix4(shape1.matrixWorld),
    );
    for (let j = 0; j < shape2.points.length - 1; j++) {
      const segment2 = new THREE.Line3(
        shape2.points[j]?.clone().applyMatrix4(shape2.matrixWorld),
        shape2.points[j + 1]?.clone().applyMatrix4(shape2.matrixWorld),
      );
      const maybeIntersection = getIntersection(
        segment1.start,
        segment1.end,
        segment2.start,
        segment2.end,
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
    until?: THREE.Vector3 | undefined,
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
          .applyMatrix4(shape.matrixWorld),
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
        `No intersection between ${startPoint.toArray()} and ${shape}`,
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
      this.segmentClosestToPoint,
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
          prevIndex,
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
      until,
    );
    return this;
  }

  extendCurve(
    shape: Geometry.Shape,
    initialPointIndex: number,
    forward: boolean,
    until?: THREE.Vector3 | undefined,
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
  vstack,
  vspace,
  furthestInDirection,
  moveToRightOf,
  moveToLeftOf,
  moveAbove,
  moveBelow,
  moveNextTo,
  rotate90,
  rotate180,
  rotate270,
  getBoundingBoxCenter,
  getBoundingBoxHelper,
  transformBetweenSpaces,
  convertWorldDirectionToObjectSpace,
  intersectionsBetween,
  pointAlongCurve,
  ShapeFromCurves,
  BUFFER,
  RIGHT,
  LEFT,
  UP,
  DOWN,
  OUT,
  IN,
  ORIGIN,
};
