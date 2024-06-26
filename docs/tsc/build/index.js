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
    if ((this.components && this.components.includes(name)) || this[name]) {
        throw new Error(`Failed to add component ${name}: Component or attribute already exists`);
    }
    if (!this.components) {
        this.components = [];
    }
    this.components.push(name);
    child.parentComponent = this;
    this[name] = child;
    this.add(child);
    return this;
};
THREE.Object3D.prototype.removeComponent = function (name) {
    if (!this.components || !this.components.includes(name) || !this[name]) {
        throw new Error(`Failed to remove component ${name}: No such component`);
    }
    this.components = this.components.filter((componentName) => componentName !== name);
    this[name].parentComponent = null;
    this.remove(this[name]);
    return this;
};
THREE.Object3D.prototype.reveal = function () {
    if (!this.parentComponent) {
        throw new Error("Attempt to reveal a component with no parent");
    }
    this.parentComponent.add(this);
    return this;
};
THREE.Object3D.prototype.hide = function () {
    if (!this.parentComponent) {
        throw new Error("Attempt to hide a component with no parent");
    }
    this.parentComponent.remove(this);
    return this;
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
    if (!this.components)
        return;
    this.components.forEach((name) => this.add(this[name]));
    return this;
};
THREE.Object3D.prototype.hideComponents = function () {
    if (!this.components)
        return;
    this.components.forEach((name) => this.remove(this[name]));
    return this;
};
THREE.Object3D.prototype.revealComponent = function (name) {
    if (!this.components || !this.components.includes(name)) {
        throw new Error(`Failed to reveal component ${name}: No such component`);
    }
    this.components[name].reveal();
    return this;
};
THREE.Object3D.prototype.hideComponent = function (name) {
    if (!this.components || !this.components.includes(name)) {
        throw new Error(`Failed to hide component ${name}: No such component`);
    }
    this.components[name].hide();
    return this;
};
THREE.Object3D.prototype.traverseComponents = function (f) {
    f(this);
    const components = this.components
        ? this.components.map((name) => this[name])
        : [];
    [...components].forEach((obj) => obj && obj.traverseComponents(f));
};
THREE.Object3D.prototype.traverseAncestorComponents = function (f) {
    f(this);
    this.parentComponent && this.parentComponent.traverseAncestorComponents(f);
};
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
THREE.Object3D.prototype.shiftPosition = function (offset) {
    this.position.add(offset);
    const thisSpaceDirection = Utils.convertWorldDirectionToObjectSpace(offset, this);
    thisSpaceDirection.multiplyScalar(offset.length() / thisSpaceDirection.length());
    thisSpaceDirection.negate();
    this.children.forEach((child) => child.position.add(thisSpaceDirection));
    return this;
};
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
export { Geometry, Animation, Text, SceneController, Graphing, setupCanvas, THREE, SVGLoader, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport, Frame, };
//# sourceMappingURL=index.js.map