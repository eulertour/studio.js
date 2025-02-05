import * as THREE from "three";
import * as Utils from "./utils.js";
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
THREE.Vector3.prototype.positiveAngleTo = function (other) {
    return Utils.positiveAngleTo(this, other);
};
THREE.Vector3.prototype.rotateZ = function (angle) {
    return this.applyAxisAngle(Utils.OUT, angle);
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
    if (this.components?.has(name)) {
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
THREE.Object3D.prototype.updateComponent = (name, child) => {
    throw new Error("Not implemented");
};
THREE.Object3D.prototype.removeComponent = function (name) {
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
THREE.Object3D.prototype.revealDescendants = function (config) {
    this.traverseComponents((obj) => obj.parentComponent && obj.reveal(), config);
    return this;
};
THREE.Object3D.prototype.hideDescendants = function (config) {
    this.traverseComponents((obj) => obj.parentComponent && obj.hide(), config);
    return this;
};
THREE.Object3D.prototype.revealAncestors = function (config) {
    this.traverseAncestorComponents((obj) => obj.parentComponent && obj.reveal(), config);
    return this;
};
THREE.Object3D.prototype.hideAncestors = function (config) {
    this.traverseAncestorComponents((obj) => obj.parentComponent && obj.hide(), config);
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
THREE.Object3D.prototype.traverseComponents = function (f, config) {
    if (config?.includeSelf)
        f(this);
    if (!this.components)
        return;
    this.components.forEach((child) => {
        f(child);
        child.traverseComponents(f);
    });
};
THREE.Object3D.prototype.traverseAncestorComponents = function (f, config) {
    if (config?.includeSelf)
        f(this);
    if (!this.parentComponent)
        return;
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
        if (child === this.stroke || child === this.fill)
            return;
        child.position.sub(offset);
    });
    return this;
};
THREE.Object3D.prototype.reorient = () => { };
import { setCameraDimensions, setCanvasViewport, } from "./geometry/MeshLine/MeshLineMaterial.js";
import * as Animation from "./animation/index.js";
import * as Constants from "./constants.js";
import * as Diagram from "./diagram.js";
import Frame from "./frame.js";
import * as Geometry from "./geometry/index.js";
import * as Graphing from "./graphing.js";
import { SceneController, } from "./scene.js";
import * as Text from "./text.js";
import { setupCanvas } from "./utils.js";
export { component, Geometry, Animation, Text, SceneController, Graphing, setupCanvas, THREE, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport, Frame, };
//# sourceMappingURL=index.js.map