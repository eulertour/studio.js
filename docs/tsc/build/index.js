import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import * as Utils from "./utils";
THREE.Object3D.prototype.setScale = function (factor) {
    this.scale.x = factor;
    this.scale.y = factor;
    this.scale.z = factor;
    return this;
};
THREE.Object3D.prototype.moveNextTo = function (target, direction, distance) {
    Utils.moveNextTo(target, this, direction, distance);
};
THREE.Object3D.prototype.moveToRightOf = function (target, distance) {
    Utils.moveToRightOf(target, this, distance);
};
THREE.Object3D.prototype.moveToLeftOf = function (target, distance) {
    Utils.moveToLeftOf(target, this, distance);
};
THREE.Object3D.prototype.moveAbove = function (target, distance) {
    Utils.moveAbove(target, this, distance);
};
THREE.Object3D.prototype.moveBelow = function (target, distance) {
    Utils.moveBelow(target, this, distance);
};
THREE.Object3D.prototype.setOpacity = function (opacity) {
    this.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material.opacity = opacity;
        }
    });
    return this;
};
THREE.Object3D.prototype.setInvisible = function () {
    return THREE.Object3D.prototype.setOpacity(0);
};
THREE.Object3D.prototype.setVisible = function () {
    return this.setOpacity(1);
};
import * as Geometry from "./geometry";
import * as Animation from "./animation";
import * as Text from "./text";
import { SceneController } from "./scene";
import { setupCanvas } from "./utils";
import * as Diagram from "./diagram";
import * as Constants from "./constants";
import { setCameraDimensions, setCanvasViewport, } from "./MeshLine/MeshLineMaterial";
export { Geometry, Animation, Text, SceneController, setupCanvas, THREE, SVGLoader, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport, };
//# sourceMappingURL=index.js.map