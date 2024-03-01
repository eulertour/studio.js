import * as Utils from "./utils";
import { Object3D, Mesh } from "three";
Object3D.prototype.setScale = function (factor) {
    this.scale.x = factor;
    this.scale.y = factor;
    this.scale.z = factor;
    return this;
};
Object3D.prototype.moveNextTo = function (target, direction, distance) {
    Utils.moveNextTo(target, this, direction, distance);
};
Object3D.prototype.moveToRightOf = function (target, distance) {
    Utils.moveToRightOf(target, this, distance);
};
Object3D.prototype.moveToLeftOf = function (target, distance) {
    Utils.moveToLeftOf(target, this, distance);
};
Object3D.prototype.moveAbove = function (target, distance) {
    Utils.moveAbove(target, this, distance);
};
Object3D.prototype.moveBelow = function (target, distance) {
    Utils.moveBelow(target, this, distance);
};
Object3D.prototype.setOpacity = function (opacity) {
    this.traverse((child) => {
        if (child instanceof Mesh) {
            child.material.opacity = opacity;
        }
    });
    return this;
};
Object3D.prototype.setInvisible = function () {
    return this.setOpacity(0);
};
Object3D.prototype.setVisible = function () {
    return this.setOpacity(1);
};
import * as Geometry from "./geometry";
import * as Animation from "./animation";
import * as Text from "./text";
import { SceneController } from "./scene";
import { setupCanvas } from "./utils";
import * as THREE from "three";
import * as Diagram from "./diagram";
import * as Constants from "./constants";
import { setCameraDimensions, setCanvasViewport } from "./MeshLine/MeshLineMaterial";
export { Geometry, Animation, Text, SceneController, setupCanvas, THREE, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport };
//# sourceMappingURL=index.js.map