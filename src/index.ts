import * as THREE from "three/webgpu";
import * as Utils from "./utils.js";

declare module "three/webgpu" {
  export interface Object3D {
    vstack(buffer?: number): THREE.Object3D;
    vspace(distanceBetween?: number): THREE.Object3D;
    setScale(factor: number): THREE.Object3D;
    moveNextTo(
      target: THREE.Object3D,
      direction: THREE.Vector3,
      distance?: number,
    ): void;
    moveToRightOf(target: THREE.Object3D, distance?: number): void;
    moveToLeftOf(target: THREE.Object3D, distance?: number): void;
    moveAbove(target: THREE.Object3D, distance?: number): void;
    moveBelow(target: THREE.Object3D, distance?: number): void;
    setOpacity(opacity: number, config?: any): THREE.Object3D;
    setInvisible(config?: any): THREE.Object3D;
    setVisible(config?: any): THREE.Object3D;
    setUpright(): THREE.Object3D;
    recenter(center: THREE.Vector3): THREE.Object3D;
    reorient(zRotation: number): void;
    pointAlongCurve(t: number): THREE.Vector3;
    addComponent<T extends THREE.Object3D, K extends string>(
      name: K,
      child: T,
    ): this & { [P in K]: T };
    updateComponent(name: string, child: THREE.Object3D): void;
    removeComponent(name: string): THREE.Object3D;
    hideComponents(): THREE.Object3D;
    revealComponents(): THREE.Object3D;
    hide(): THREE.Object3D;
    reveal(): THREE.Object3D;
    isHidden(): boolean;
    isRevealed(): boolean;
    isComponent(): boolean;
    revealDescendants(config?: { includeSelf: boolean }): this;
    hideDescendants(config?: { includeSelf: boolean }): THREE.Object3D;
    revealAncestors(config?: { includeSelf: boolean }): THREE.Object3D;
    hideAncestors(config?: { includeSelf: boolean }): THREE.Object3D;
    revealLineage(): THREE.Object3D;
    hideLineage(): THREE.Object3D;
    traverseComponents(f: () => void, config?: { includeSelf: boolean }): void;
    traverseAncestorComponents(
      f: () => void,
      config?: { includeSelf: boolean },
    ): void;
  }
}

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
  distance?: number,
) {
  return Utils.moveNextTo(target, this, direction, distance);
};

THREE.Object3D.prototype.moveToRightOf = function (
  target: THREE.Object3D,
  distance?: number,
) {
  return Utils.moveToRightOf(target, this, distance);
};

THREE.Object3D.prototype.moveToLeftOf = function (
  target: THREE.Object3D,
  distance?: number,
) {
  return Utils.moveToLeftOf(target, this, distance);
};

THREE.Object3D.prototype.moveAbove = function (
  target: THREE.Object3D,
  distance?: number,
) {
  return Utils.moveAbove(target, this, distance);
};

THREE.Object3D.prototype.moveBelow = function (
  target: THREE.Object3D,
  distance?: number,
) {
  return Utils.moveBelow(target, this, distance);
};

THREE.Object3D.prototype.addComponent = function <T extends THREE.Object3D>(
  name: string,
  child: T & { parentComponent: THREE.Object3D | undefined },
) {
  if (this.components?.has(name)) {
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
  Object.defineProperty(this, name, {
    get: () => this.components.get(name),
    set: (value) => this.setComponent(name, value),
    configurable: true,
  });
  return this;
};

THREE.Object3D.prototype.updateComponent = (
  name: string,
  child: THREE.Object3D,
) => {
  throw new Error("Not implemented");
};

THREE.Object3D.prototype.removeComponent = function (name: string) {
  if (!this.components || !this.components.has(name)) {
    throw new Error(`Failed to remove component ${name}: No such component`);
  }
  const child = this.components.get(name);
  if (!child) {
    throw new Error(`Component ${name} is not defined`);
  }
  this.components.delete(name);
  child.parentComponent = undefined;
  this.remove(child);
  Object.defineProperty(this, name, { value: undefined });
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
  if (!this.isComponent()) {
    throw new Error("Attempt to check revealed status of a non-component");
  }
  return !this.isRevealed();
};

THREE.Object3D.prototype.revealDescendants = function (config?: {
  includeSelf: boolean;
}) {
  this.traverseComponents((obj) => obj.parentComponent && obj.reveal(), config);
  return this;
};

THREE.Object3D.prototype.hideDescendants = function (config?: {
  includeSelf: boolean;
}) {
  this.traverseComponents((obj) => obj.parentComponent && obj.hide(), config);
  return this;
};

THREE.Object3D.prototype.revealAncestors = function (config?: {
  includeSelf: boolean;
}) {
  this.traverseAncestorComponents(
    (obj) => obj.parentComponent && obj.reveal(),
    config,
  );
  return this;
};

THREE.Object3D.prototype.hideAncestors = function (config?: {
  includeSelf: boolean;
}) {
  this.traverseAncestorComponents(
    (obj) => obj.parentComponent && obj.hide(),
    config,
  );
  return this;
};

THREE.Object3D.prototype.revealComponents = function () {
  this.components?.forEach((child) => this.add(child));
  return this;
};

THREE.Object3D.prototype.hideComponents = function () {
  this.components?.forEach((child) => this.remove(child));
  return this;
};

THREE.Object3D.prototype.traverseComponents = function (
  f: (o: THREE.Object3D) => void,
  config?: { includeSelf: boolean },
) {
  if (config?.includeSelf) f(this);
  if (!this.components) return;
  this.components.forEach((child) => {
    f(child);
    child.traverseComponents(f);
  });
};

THREE.Object3D.prototype.traverseAncestorComponents = function (
  f: (o: THREE.Object3D) => void,
  config?: { includeSelf: boolean },
) {
  if (config?.includeSelf) f(this);
  if (!this.parentComponent) return;
  f(this.parentComponent);
  this.parentComponent.traverseAncestorComponents(f);
};

THREE.Object3D.prototype.revealLineage = function () {
  this.revealAncestors({ includeSelf: true });
  this.revealDescendants({ includeSelf: true });
  return this;
};

THREE.Object3D.prototype.hideLineage = function () {
  this.hideAncestors({ includeSelf: true });
  this.hideDescendants({ includeSelf: true });
  return this;
};

type ComponentParent = THREE.Object3D & {
  components?: Map<string, THREE.Object3D>;
};
function component(
  _: ClassAccessorDecoratorTarget<ComponentParent, THREE.Object3D>,
  context: ClassAccessorDecoratorContext<ComponentParent, THREE.Object3D>,
): ClassAccessorDecoratorResult<ComponentParent, any> {
  const propertyName = String(context.name);
  return {
    set(value) {
      if (value === undefined) return;
      this.addComponent(propertyName, value);
    },
    get() {
      if (this.components === undefined) return undefined;
      return this.components.get(propertyName);
    },
  };
}

THREE.Object3D.prototype.setOpacity = function (
  opacity: number,
  config?: any,
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

THREE.Object3D.prototype.setInvisible = function (
  config?: any,
): THREE.Object3D {
  let family = true;
  if (config && config.family === false) {
    family = false;
  }

  return this.setOpacity(0, { family });
};

THREE.Object3D.prototype.setVisible = function (config?: any): THREE.Object3D {
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

THREE.Object3D.prototype.recenter = function (
  globalPosition: THREE.Vector3,
): THREE.Object3D {
  const localPosition = globalPosition.clone();
  this.worldToLocal(globalPosition.clone());
  const offset = new THREE.Vector3().subVectors(localPosition, this.position);
  this.position.add(offset);

  if (this.points) {
    // Update stroke and fill geometries.
    const newPoints = this.points.map((point) => point.clone().sub(offset));
    if (this.stroke) {
      this.stroke.geometry.setPoints(newPoints);
    }
    if (this.fill) {
      for (let i = 0; i < this.stroke.geometry.points.length - 1; i++) {
        const { x, y, z } = newPoints[i];
        this.fill.geometry.attributes.position.array[i * 3] = x;
        this.fill.geometry.attributes.position.array[i * 3 + 1] = y;
        this.fill.geometry.attributes.position.array[i * 3 + 2] = z;
      }
    }
  }

  // Update children.
  this.children.forEach((child) => {
    if (child === this.stroke || child === this.fill) return;
    child.position.sub(offset);
  });

  return this;
};

THREE.Object3D.prototype.reorient = (): void => {};
import * as Animation from "./animation/index.js";
import * as Constants from "./constants.js";
import * as Diagram from "./diagram/index.js";
import * as Geometry from "./geometry/index.js";
import * as Graphing from "./graphing.js";
import Frame from "./frame.js";
import {
  type AnimationRepresentation,
  SceneController,
  type StudioScene,
} from "./scene.js";
import * as Text from "./text.js";
import { setupCanvas, SceneCanvasConfig } from "./utils.js";
import WebGPUMeshLineMaterial from "./geometry/WebGPUMeshLine/Material.js";

import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

export {
  component,
  Geometry,
  Animation,
  Text,
  SceneController,
  Graphing,
  setupCanvas,
  THREE,
  WebGPUMeshLineMaterial,
  type StudioScene,
  type SceneCanvasConfig,
  type AnimationRepresentation,
  Utils,
  Diagram,
  Constants,
  Frame,
  SVGLoader,
  TextGeometry,
  FontLoader,
};
