import * as THREE from "three";
import { SVGLoader } from "./SVGLoader.js";
// import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as Utils from "./utils";

declare module "three" {
  export interface Object3D {
    setScale(factor: number): THREE.Object3D;
    moveNextTo(
      target: THREE.Object3D,
      direction: THREE.Vector3,
      distance?,
    ): void;
    moveToRightOf(target: THREE.Object3D, distance?): void;
    moveToLeftOf(target: THREE.Object3D, distance?): void;
    moveAbove(target: THREE.Object3D, distance?): void;
    moveBelow(target: THREE.Object3D, distance?): void;
    setOpacity(opacity: number): THREE.Object3D;
    setInvisible(): THREE.Object3D;
    setVisible(config?): THREE.Object3D;
    setUpright(): THREE.Object3D;
    shiftPosition(offset: THREE.Vector3): THREE.Object3D;
    pointAlongCurve(t: number): THREE.Vector3;
  }

  export interface Vector3 {
    rotate90(): THREE.Vector3;
    rotate180(): THREE.Vector3;
    rotate270(): THREE.Vector3;
  }
}

THREE.Vector3.prototype.rotate90 = function (): THREE.Vector3 {
  return Utils.rotate90(this);
};

THREE.Vector3.prototype.rotate180 = function (): THREE.Vector3 {
  return Utils.rotate180(this);
};

THREE.Vector3.prototype.rotate270 = function (): THREE.Vector3 {
  return Utils.rotate270(this);
};

THREE.Object3D.prototype.setScale = function (factor): THREE.Object3D {
  this.scale.x = factor;
  this.scale.y = factor;
  return this;
};

THREE.Object3D.prototype.pointAlongCurve = function (t: number) {
  return Utils.pointAlongCurve(this, t);
};

THREE.Object3D.prototype.moveNextTo = function (
  target: THREE.Object3D,
  direction: THREE.Vector3,
  distance?,
) {
  return Utils.moveNextTo(target, this, direction, distance);
};

THREE.Object3D.prototype.moveToRightOf = function (
  target: THREE.Object3D,
  distance?,
) {
  return Utils.moveToRightOf(target, this, distance);
};

THREE.Object3D.prototype.moveToLeftOf = function (
  target: THREE.Object3D,
  distance?,
) {
  return Utils.moveToLeftOf(target, this, distance);
};

THREE.Object3D.prototype.moveAbove = function (
  target: THREE.Object3D,
  distance?,
) {
  return Utils.moveAbove(target, this, distance);
};

THREE.Object3D.prototype.moveBelow = function (
  target: THREE.Object3D,
  distance?,
) {
  return Utils.moveBelow(target, this, distance);
};

THREE.Object3D.prototype.setOpacity = function (
  opacity: number,
  config?,
): THREE.Object3D {
  let family = true;
  if (config && config.family === false) {
    family = false;
  }

  if (family) {
    this.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.opacity = opacity;
      }
    });
  } else {
    [this.stroke, this.fill].forEach((mesh) => {
      if (!mesh) return;
      mesh.material.opacity = opacity;
    });
  }
  return this;
};

THREE.Object3D.prototype.setInvisible = function (config?): THREE.Object3D {
  let family = true;
  if (config && config.family === false) {
    family = false;
  }

  return this.setOpacity(0, { family });
};

THREE.Object3D.prototype.setVisible = function (config?): THREE.Object3D {
  let family = true;
  if (config && config.family === false) {
    family = false;
  }
  return this.setOpacity(1, { family });
};

THREE.Object3D.prototype.setUpright = function (): THREE.Object3D {
  const worldQuaternion = new THREE.Quaternion();
  this.getWorldQuaternion(worldQuaternion);

  const inverseQuaternion = worldQuaternion.clone().invert();
  this.quaternion.copy(inverseQuaternion);
  return this;
};

THREE.Object3D.prototype.shiftPosition = function (
  offset: THREE.Vector3,
): THREE.Object3D {
  this.position.add(offset);

  const thisSpaceDirection = Utils.convertWorldDirectionToObjectSpace(
    offset,
    this,
  );
  thisSpaceDirection.multiplyScalar(
    offset.length() / thisSpaceDirection.length(),
  );
  thisSpaceDirection.negate();

  this.children.forEach((child: THREE.Object3D) =>
    child.position.add(thisSpaceDirection),
  );
  return this;
};

import * as Geometry from "./geometry";
import * as Animation from "./animation";
import * as Text from "./text";
import { setupCanvas } from "./utils";
import {
  SceneController,
  type StudioScene,
  type AnimationRepresentation,
} from "./scene";
import * as Diagram from "./diagram";
import * as Constants from "./constants";
import {
  setCameraDimensions,
  setCanvasViewport,
} from "./MeshLine/MeshLineMaterial";
import * as Graphing from "./graphing";
import Frame from "./frame.js";

export {
  Geometry,
  Animation,
  Text,
  SceneController,
  Graphing,
  setupCanvas,
  THREE,
  SVGLoader,
  type StudioScene,
  type AnimationRepresentation,
  Utils,
  Diagram,
  Constants,
  setCameraDimensions,
  setCanvasViewport,
  Frame,
};
