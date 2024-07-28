import * as THREE from "three";
import { SVGLoader } from "./SVGLoader.js";
// import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as Utils from "./utils";

declare module "three" {
  export interface Object3D {
    vstack(buffer?: number): THREE.Object3D;
    vspace(distanceBetween?: number): THREE.Object3D;
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
    addComponent(name: string, child: THREE.Object3D): THREE.Object3D;
    removeComponent(name: string): THREE.Object3D;
    hideComponents(): THREE.Object3D;
    revealComponents(): THREE.Object3D;
    hide(): THREE.Object3D;
    reveal(): THREE.Object3D;
    isHidden(): boolean;
    isRevealed(): boolean;
    isComponent(): boolean;
    revealDescendants(): THREE.Object3D;
    hideDescendants(): THREE.Object3D;
    revealAncestors(): THREE.Object3D;
    hideAncestors(): THREE.Object3D;
    traverseComponents(f: () => void): void;
    traverseAncestorComponents(f: () => void): void;
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

THREE.Object3D.prototype.vstack = function (buffer = 0.2): THREE.Object3D {
  return Utils.vstack(this, buffer);
};

THREE.Object3D.prototype.vspace = function (
  distanceBetween?: number,
): THREE.Object3D {
  return Utils.vspace(this, distanceBetween);
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

THREE.Object3D.prototype.addComponent = function (
  name: string,
  child: THREE.Object3D & { parentComponent: THREE.Object3D | undefined },
) {
  if (this.components && this.components.has(name)) {
    throw new Error(
      `Failed to add component ${name}: Component or attribute already exists`,
    );
  }
  if (!this.components) {
    this.components = new Map();
  }
  this.components.set(name, child);
  child.parentComponent = this;
  this.add(child);
  return this;
};

THREE.Object3D.prototype.removeComponent = function (name: string) {
  if (!this.components || !this.components.has(name)) {
    throw new Error(`Failed to remove component ${name}: No such component`);
  }
  const child = this.components.get(name);
  this.components.delete(name);
  child.parentComponent = undefined;
  this.remove(child);
  return this;
};

THREE.Object3D.prototype.reveal = function () {
  if (!this.parentComponent) {
    throw new Error("Attempt to reveal a component with no parent component");
  }
  this.parentComponent.add(this);
  return this;
};

THREE.Object3D.prototype.hide = function () {
  if (!this.parentComponent) {
    throw new Error("Attempt to hide a component with no parent component");
  }
  this.parentComponent.remove(this);
  return this;
};

THREE.Object3D.prototype.isComponent = function () {
  return this.parentComponent !== undefined;
};

THREE.Object3D.prototype.isRevealed = function () {
  if (!this.isComponent()) {
    throw new Error("Attempt to check revealed status of a non-component");
  }
  return this.parentComponent.children.includes(this) ?? false;
};

THREE.Object3D.prototype.isHidden = function () {
  return !this.isRevealed();
};

THREE.Object3D.prototype.revealDescendants = function () {
  this.traverseComponents((obj) => obj.parentComponent && obj.reveal());
  return this;
};

THREE.Object3D.prototype.hideDescendants = function () {
  this.traverseComponents((obj) => obj.parentComponent && obj.hide());
  return this;
};

THREE.Object3D.prototype.revealAncestors = function () {
  this.traverseAncestorComponents((obj) => obj.parentComponent && obj.reveal());
  return this;
};

THREE.Object3D.prototype.hideAncestors = function () {
  this.traverseAncestorComponents((obj) => obj.parentComponent && obj.hide());
  return this;
};

THREE.Object3D.prototype.revealComponents = function () {
  if (!this.components) return;
  this.components.values.forEach((child) => this.add(child));
  return this;
};

THREE.Object3D.prototype.hideComponents = function () {
  if (!this.components) return;
  this.components.values.forEach((child) => this.remove(child));
  return this;
};

THREE.Object3D.prototype.traverseComponents = function (
  f: (o: THREE.Object3D) => void,
) {
  f(this);
  this.components.values.forEach(
    (child) => child && child.traverseComponents(f),
  );
};

THREE.Object3D.prototype.traverseAncestorComponents = function (
  f: (o: THREE.Object3D) => void,
) {
  f(this);
  this.parentComponent && this.parentComponent.traverseAncestorComponents(f);
};

const component = (
  _: undefined,
  context: ClassFieldDecoratorContext<Object3D, Object3D> & {
    name: string;
    private: boolean;
    static: boolean;
  },
): ((this: Object3D, value: Object3D) => Object3D) | void => {
  return function (
    this: Object3D & { components: Map<string, Object3D> },
    defaultValue: Object3D,
  ) {
    Object.defineProperty(this, context.name, {
      get: () => {
        return this.components.get(context.name);
      },
      set: (value) => {
        if (value === undefined) return;
        this.addComponent(context.name, value);
      },
    });
    return defaultValue;
  };
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
import { Object3D } from "three/src/Three.js";

export {
  component,
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
