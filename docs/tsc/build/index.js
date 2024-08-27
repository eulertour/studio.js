import * as THREE from "three";
import { SVGLoader } from "./SVGLoader.js";
// import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as Utils from "./utils";
THREE.Vector3.prototype.rotate90 = function () {
    return Utils.rotate90(this);
};
THREE.Vector3.prototype.rotate180 = function () {
    return Utils.rotate180(this);
};
THREE.Vector3.prototype.rotate270 = function () {
    return Utils.rotate270(this);
};
THREE.Vector3.prototype.transformBetweenSpaces = function (from, to) {
    return Utils.transformBetweenSpaces(from, to, this);
};
THREE.Object3D.prototype.vstack = function (buffer = 0.2) {
    return Utils.vstack(this, buffer);
};
THREE.Object3D.prototype.vspace = function (distanceBetween) {
    return Utils.vspace(this, distanceBetween);
};
THREE.Object3D.prototype.setScale = function (factor) {
    this.scale.x = factor;
    this.scale.y = factor;
    return this;
};
THREE.Object3D.prototype.pointAlongCurve = function (t) {
    return Utils.pointAlongCurve(this, t);
};
THREE.Object3D.prototype.moveNextTo = function (target, direction, distance) {
    return Utils.moveNextTo(target, this, direction, distance);
};
THREE.Object3D.prototype.moveToRightOf = function (target, distance) {
    return Utils.moveToRightOf(target, this, distance);
};
THREE.Object3D.prototype.moveToLeftOf = function (target, distance) {
    return Utils.moveToLeftOf(target, this, distance);
};
THREE.Object3D.prototype.moveAbove = function (target, distance) {
    return Utils.moveAbove(target, this, distance);
};
THREE.Object3D.prototype.moveBelow = function (target, distance) {
    return Utils.moveBelow(target, this, distance);
};
THREE.Object3D.prototype.addComponent = function (name, child) {
    if (this.components && this.components.has(name)) {
        throw new Error(`Failed to add component ${name}: Component or attribute already exists`);
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
THREE.Object3D.prototype.updateComponent = function (name, child) {
    throw new Error("Not implemented");
};
THREE.Object3D.prototype.removeComponent = function (name) {
    if (!this.components || !this.components.has(name)) {
        throw new Error(`Failed to remove component ${name}: No such component`);
    }
    const child = this.components.get(name);
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
    this.components && this.components.forEach((child) => this.add(child));
    return this;
};
THREE.Object3D.prototype.hideComponents = function () {
    this.components && this.components.forEach((child) => this.remove(child));
    return this;
};
THREE.Object3D.prototype.traverseComponents = function (f) {
    f(this);
    this.components &&
        this.components.forEach((child) => child && child.traverseComponents(f));
};
THREE.Object3D.prototype.traverseAncestorComponents = function (f) {
    f(this);
    this.parentComponent && this.parentComponent.traverseAncestorComponents(f);
};
THREE.Object3D.prototype.revealLineage = function () {
    this.revealAncestors();
    this.revealDescendants();
    return this;
};
THREE.Object3D.prototype.hideLineage = function () {
    this.hideAncestors();
    this.hideDescendants();
    return this;
};
function component(_, context) {
    const propertyName = String(context.name);
    return {
        set(value) {
            if (value === undefined)
                return;
            this.addComponent(propertyName, value);
        },
        get() {
            if (this.components === undefined)
                return undefined;
            return this.components.get(propertyName);
        },
    };
}
THREE.Object3D.prototype.setOpacity = function (opacity, config) {
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
    }
    else {
        [this.stroke, this.fill].forEach((mesh) => {
            if (!mesh)
                return;
            mesh.material.opacity = opacity;
        });
    }
    return this;
};
THREE.Object3D.prototype.setInvisible = function (config) {
    let family = true;
    if (config && config.family === false) {
        family = false;
    }
    return this.setOpacity(0, { family });
};
THREE.Object3D.prototype.setVisible = function (config) {
    let family = true;
    if (config && config.family === false) {
        family = false;
    }
    return this.setOpacity(1, { family });
};
THREE.Object3D.prototype.setUpright = function () {
    const worldQuaternion = new THREE.Quaternion();
    this.getWorldQuaternion(worldQuaternion);
    const inverseQuaternion = worldQuaternion.clone().invert();
    this.quaternion.copy(inverseQuaternion);
    return this;
};
THREE.Object3D.prototype.recenter = function (globalPosition) {
    const localPosition = globalPosition.clone();
    this.worldToLocal(localPosition);
    const offset = new THREE.Vector3().subVectors(localPosition, this.position);
    this.position.add(offset);
    this.children.forEach((child) => child.position.sub(offset));
    return this;
};
THREE.Object3D.prototype.reorient = function () { };
import * as Geometry from "./geometry";
import * as Animation from "./animation";
import * as Text from "./text";
import { setupCanvas } from "./utils";
import { SceneController, } from "./scene";
import * as Diagram from "./diagram";
import * as Constants from "./constants";
import { setCameraDimensions, setCanvasViewport, } from "./MeshLine/MeshLineMaterial";
import * as Graphing from "./graphing";
import Frame from "./frame.js";
export { component, Geometry, Animation, Text, SceneController, Graphing, setupCanvas, THREE, SVGLoader, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport, Frame, };
//# sourceMappingURL=index.js.map