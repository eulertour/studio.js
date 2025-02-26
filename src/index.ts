import * as BaseTHREE from "three";
import * as Utils from "./utils.js";

declare module "three" {
  export interface Object3D {
    vstack(buffer?: number): BaseTHREE.Object3D;
    vspace(distanceBetween?: number): BaseTHREE.Object3D;
    setScale(factor: number): BaseTHREE.Object3D;
    moveNextTo(
      target: BaseTHREE.Object3D,
      direction: BaseTHREE.Vector3,
      distance?: number,
    ): void;
    moveToRightOf(target: BaseTHREE.Object3D, distance?: number): void;
    moveToLeftOf(target: BaseTHREE.Object3D, distance?: number): void;
    moveAbove(target: BaseTHREE.Object3D, distance?: number): void;
    moveBelow(target: BaseTHREE.Object3D, distance?: number): void;
    setOpacity(opacity: number, config?: any): BaseTHREE.Object3D;
    setInvisible(config?: any): BaseTHREE.Object3D;
    setVisible(config?: any): BaseTHREE.Object3D;
    setUpright(): BaseTHREE.Object3D;
    recenter(center: BaseTHREE.Vector3): BaseTHREE.Object3D;
    reorient(zRotation: number): void;
    pointAlongCurve(t: number): BaseTHREE.Vector3;
    addComponent<T extends BaseTHREE.Object3D, K extends string>(
      name: K,
      child: T,
    ): this & { [P in K]: T };
    updateComponent(name: string, child: BaseTHREE.Object3D): void;
    removeComponent(name: string): BaseTHREE.Object3D;
    hideComponents(): BaseTHREE.Object3D;
    revealComponents(): BaseTHREE.Object3D;
    hide(): BaseTHREE.Object3D;
    reveal(): BaseTHREE.Object3D;
    isHidden(): boolean;
    isRevealed(): boolean;
    isComponent(): boolean;
    revealDescendants(config?: { includeSelf: boolean }): this;
    hideDescendants(config?: { includeSelf: boolean }): BaseTHREE.Object3D;
    revealAncestors(config?: { includeSelf: boolean }): BaseTHREE.Object3D;
    hideAncestors(config?: { includeSelf: boolean }): BaseTHREE.Object3D;
    revealLineage(): BaseTHREE.Object3D;
    hideLineage(): BaseTHREE.Object3D;
    traverseComponents(f: () => void, config?: { includeSelf: boolean }): void;
    traverseAncestorComponents(
      f: () => void,
      config?: { includeSelf: boolean },
    ): void;
  }
}

BaseTHREE.Object3D.prototype.vstack = function (
  buffer = 0.2,
): BaseTHREE.Object3D {
  return Utils.vstack(this, buffer);
};

BaseTHREE.Object3D.prototype.vspace = function (
  distanceBetween?: number,
): BaseTHREE.Object3D {
  return Utils.vspace(this, distanceBetween);
};

BaseTHREE.Object3D.prototype.setScale = function (factor): BaseTHREE.Object3D {
  this.scale.x = factor;
  this.scale.y = factor;
  return this;
};

BaseTHREE.Object3D.prototype.pointAlongCurve = function (t: number) {
  return Utils.pointAlongCurve(this, t);
};

BaseTHREE.Object3D.prototype.moveNextTo = function (
  target: BaseTHREE.Object3D,
  direction: BaseTHREE.Vector3,
  distance?: number,
) {
  return Utils.moveNextTo(target, this, direction, distance);
};

BaseTHREE.Object3D.prototype.moveToRightOf = function (
  target: BaseTHREE.Object3D,
  distance?: number,
) {
  return Utils.moveToRightOf(target, this, distance);
};

BaseTHREE.Object3D.prototype.moveToLeftOf = function (
  target: BaseTHREE.Object3D,
  distance?: number,
) {
  return Utils.moveToLeftOf(target, this, distance);
};

BaseTHREE.Object3D.prototype.moveAbove = function (
  target: BaseTHREE.Object3D,
  distance?: number,
) {
  return Utils.moveAbove(target, this, distance);
};

BaseTHREE.Object3D.prototype.moveBelow = function (
  target: BaseTHREE.Object3D,
  distance?: number,
) {
  return Utils.moveBelow(target, this, distance);
};

BaseTHREE.Object3D.prototype.addComponent = function <
  T extends BaseTHREE.Object3D,
>(
  name: string,
  child: T & { parentComponent: BaseTHREE.Object3D | undefined },
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

BaseTHREE.Object3D.prototype.updateComponent = (
  name: string,
  child: BaseTHREE.Object3D,
) => {
  throw new Error("Not implemented");
};

BaseTHREE.Object3D.prototype.removeComponent = function (name: string) {
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

BaseTHREE.Object3D.prototype.reveal = function () {
  if (!this.parentComponent) {
    throw new Error("Attempt to reveal a component with no parent component");
  }
  this.parentComponent.add(this);
  return this;
};

BaseTHREE.Object3D.prototype.hide = function () {
  if (!this.parentComponent) {
    throw new Error("Attempt to hide a component with no parent component");
  }
  this.parentComponent.remove(this);
  return this;
};

BaseTHREE.Object3D.prototype.isComponent = function () {
  return this.parentComponent !== undefined;
};

BaseTHREE.Object3D.prototype.isRevealed = function () {
  if (!this.isComponent()) {
    throw new Error("Attempt to check revealed status of a non-component");
  }
  return this.parentComponent.children.includes(this) ?? false;
};

BaseTHREE.Object3D.prototype.isHidden = function () {
  if (!this.isComponent()) {
    throw new Error("Attempt to check revealed status of a non-component");
  }
  return !this.isRevealed();
};

BaseTHREE.Object3D.prototype.revealDescendants = function (config?: {
  includeSelf: boolean;
}) {
  this.traverseComponents((obj) => obj.parentComponent && obj.reveal(), config);
  return this;
};

BaseTHREE.Object3D.prototype.hideDescendants = function (config?: {
  includeSelf: boolean;
}) {
  this.traverseComponents((obj) => obj.parentComponent && obj.hide(), config);
  return this;
};

BaseTHREE.Object3D.prototype.revealAncestors = function (config?: {
  includeSelf: boolean;
}) {
  this.traverseAncestorComponents(
    (obj) => obj.parentComponent && obj.reveal(),
    config,
  );
  return this;
};

BaseTHREE.Object3D.prototype.hideAncestors = function (config?: {
  includeSelf: boolean;
}) {
  this.traverseAncestorComponents(
    (obj) => obj.parentComponent && obj.hide(),
    config,
  );
  return this;
};

BaseTHREE.Object3D.prototype.revealComponents = function () {
  this.components?.forEach((child) => this.add(child));
  return this;
};

BaseTHREE.Object3D.prototype.hideComponents = function () {
  this.components?.forEach((child) => this.remove(child));
  return this;
};

BaseTHREE.Object3D.prototype.traverseComponents = function (
  f: (o: BaseTHREE.Object3D) => void,
  config?: { includeSelf: boolean },
) {
  if (config?.includeSelf) f(this);
  if (!this.components) return;
  this.components.forEach((child) => {
    f(child);
    child.traverseComponents(f);
  });
};

BaseTHREE.Object3D.prototype.traverseAncestorComponents = function (
  f: (o: BaseTHREE.Object3D) => void,
  config?: { includeSelf: boolean },
) {
  if (config?.includeSelf) f(this);
  if (!this.parentComponent) return;
  f(this.parentComponent);
  this.parentComponent.traverseAncestorComponents(f);
};

BaseTHREE.Object3D.prototype.revealLineage = function () {
  this.revealAncestors({ includeSelf: true });
  this.revealDescendants({ includeSelf: true });
  return this;
};

BaseTHREE.Object3D.prototype.hideLineage = function () {
  this.hideAncestors({ includeSelf: true });
  this.hideDescendants({ includeSelf: true });
  return this;
};

type ComponentParent = BaseTHREE.Object3D & {
  components?: Map<string, BaseTHREE.Object3D>;
};
function component(
  _: ClassAccessorDecoratorTarget<ComponentParent, BaseTHREE.Object3D>,
  context: ClassAccessorDecoratorContext<ComponentParent, BaseTHREE.Object3D>,
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

BaseTHREE.Object3D.prototype.setOpacity = function (
  opacity: number,
  config?: any,
): BaseTHREE.Object3D {
  let family = true;
  if (config && config.family === false) {
    family = false;
  }

  if (family) {
    this.traverse((child) => {
      if (child instanceof BaseTHREE.Mesh) {
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

BaseTHREE.Object3D.prototype.setInvisible = function (
  config?: any,
): BaseTHREE.Object3D {
  let family = true;
  if (config && config.family === false) {
    family = false;
  }

  return this.setOpacity(0, { family });
};

BaseTHREE.Object3D.prototype.setVisible = function (
  config?: any,
): BaseTHREE.Object3D {
  let family = true;
  if (config && config.family === false) {
    family = false;
  }
  return this.setOpacity(1, { family });
};

BaseTHREE.Object3D.prototype.setUpright = function (): BaseTHREE.Object3D {
  const worldQuaternion = new BaseTHREE.Quaternion();
  this.getWorldQuaternion(worldQuaternion);

  const inverseQuaternion = worldQuaternion.clone().invert();
  this.quaternion.copy(inverseQuaternion);
  return this;
};

BaseTHREE.Object3D.prototype.recenter = function (
  globalPosition: BaseTHREE.Vector3,
): BaseTHREE.Object3D {
  const localPosition = globalPosition.clone();
  this.worldToLocal(globalPosition.clone());
  const offset = new BaseTHREE.Vector3().subVectors(
    localPosition,
    this.position,
  );
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

BaseTHREE.Object3D.prototype.reorient = (): void => {};
import {
  setCameraDimensions,
  setCanvasViewport,
} from "./geometry/MeshLine/MeshLineMaterial.js";
import * as Animation from "./animation/index.js";
import * as Constants from "./constants.js";
import * as Diagram from "./diagram.js";
import Frame from "./frame.js";
import * as Geometry from "./geometry/index.js";
import * as Graphing from "./graphing.js";
import {
  type AnimationRepresentation,
  SceneController,
  type StudioScene,
} from "./scene.js";
import * as Text from "./text.js";
import { setupCanvas, SceneCanvasConfig } from "./utils.js";
import { Vector3 } from "./vector3.js";

const THREE = {
  ...BaseTHREE,
  Vector3,
};

export {
  component,
  Geometry,
  Animation,
  Text,
  SceneController,
  Graphing,
  setupCanvas,
  THREE,
  type StudioScene,
  type SceneCanvasConfig,
  type AnimationRepresentation,
  Utils,
  Diagram,
  Constants,
  setCameraDimensions,
  setCanvasViewport,
  Frame,
};
