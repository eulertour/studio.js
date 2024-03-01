import * as Utils from "./utils";
import { Object3D, Vector3, Mesh } from "three";

declare module "three" {
  export interface Object3D {
    setScale(factor: number): Object3D;
    moveNextTo(target: Object3D, direction: Vector3, distance?): void;
    moveToRightOf(target: Object3D, distance?): void;
    moveToLeftOf(target: Object3D, distance?): void;
    moveAbove(target: Object3D, distance?): void;
    moveBelow(target: Object3D, distance?): void;
    setOpacity(opacity: number): Object3D;
    setInvisible(): Object3D;
    setVisible(): Object3D;
  }
}

Object3D.prototype.setScale = function (factor): Object3D {
    this.scale.x = factor;
    this.scale.y = factor;
    this.scale.z = factor;
    return this;
};

Object3D.prototype.moveNextTo = function (target: Object3D, direction: Vector3, distance?) {
  Utils.moveNextTo(target, this, direction, distance);
};

Object3D.prototype.moveToRightOf = function (target: Object3D, distance?) {
  Utils.moveToRightOf(target, this, distance);
};

Object3D.prototype.moveToLeftOf = function (target: Object3D, distance?) {
  Utils.moveToLeftOf(target, this, distance);
};

Object3D.prototype.moveAbove = function (target: Object3D, distance?) {
  Utils.moveAbove(target, this, distance);
};

Object3D.prototype.moveBelow = function (target: Object3D, distance?) {
  Utils.moveBelow(target, this, distance);
};

Object3D.prototype.setOpacity = function (opacity: number): Object3D {
  this.traverse((child) => {
    if (child instanceof Mesh) {
      child.material.opacity = opacity;
    }
  });
  return this;
}

Object3D.prototype.setInvisible = function (): Object3D {
  return this.setOpacity(0);
}

Object3D.prototype.setVisible = function (): Object3D {
  return this.setOpacity(1);
}

import * as Geometry from "./geometry";
import * as Animation from "./animation";
import * as Text from "./text";
import { SceneController } from "./scene";
import { setupCanvas } from "./utils";
import * as THREE from "three";
import type { StudioScene, AnimationRepresentation } from "./scene";
import * as Diagram from "./diagram";
import * as Constants from "./constants";
import { setCameraDimensions, setCanvasViewport } from "./MeshLine/MeshLineMaterial";

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
  setCanvasViewport
};