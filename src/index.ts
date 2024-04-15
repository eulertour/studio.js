import * as THREE from "three";
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
    setVisible(): THREE.Object3D;
  }
}

THREE.Object3D.prototype.setScale = function (factor): THREE.Object3D {
  this.scale.x = factor;
  this.scale.y = factor;
  this.scale.z = factor;
  return this;
};

THREE.Object3D.prototype.moveNextTo = function (
  target: THREE.Object3D,
  direction: THREE.Vector3,
  distance?,
) {
  Utils.moveNextTo(target, this, direction, distance);
};

THREE.Object3D.prototype.moveToRightOf = function (
  target: THREE.Object3D,
  distance?,
) {
  Utils.moveToRightOf(target, this, distance);
};

THREE.Object3D.prototype.moveToLeftOf = function (
  target: THREE.Object3D,
  distance?,
) {
  Utils.moveToLeftOf(target, this, distance);
};

THREE.Object3D.prototype.moveAbove = function (
  target: THREE.Object3D,
  distance?,
) {
  Utils.moveAbove(target, this, distance);
};

THREE.Object3D.prototype.moveBelow = function (
  target: THREE.Object3D,
  distance?,
) {
  Utils.moveBelow(target, this, distance);
};

THREE.Object3D.prototype.setOpacity = function (
  opacity: number,
): THREE.Object3D {
  this.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.opacity = opacity;
    }
  });
  return this;
};

THREE.Object3D.prototype.setInvisible = function (): THREE.Object3D {
  return THREE.Object3D.prototype.setOpacity(0);
};

THREE.Object3D.prototype.setVisible = function (): THREE.Object3D {
  return this.setOpacity(1);
};

import * as Geometry from "./geometry";
import * as Animation from "./animation";
import * as Text from "./text";
import { SceneController } from "./scene";
import { setupCanvas } from "./utils";
import type { StudioScene, AnimationRepresentation } from "./scene";
import * as Diagram from "./diagram";
import * as Constants from "./constants";
import {
  setCameraDimensions,
  setCanvasViewport,
} from "./MeshLine/MeshLineMaterial";

export {
  Geometry,
  Animation,
  Text,
  SceneController,
  setupCanvas,
  THREE,
  type StudioScene,
  type AnimationRepresentation,
  Utils,
  Diagram,
  Constants,
  setCameraDimensions,
  setCanvasViewport,
};

