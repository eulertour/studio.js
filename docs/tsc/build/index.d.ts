import * as THREE from "three";
import { SVGLoader } from "./SVGLoader.js";
import * as Utils from "./utils";
declare module "three" {
    interface Object3D {
        setScale(factor: number): THREE.Object3D;
        moveNextTo(target: THREE.Object3D, direction: THREE.Vector3, distance?: any): void;
        moveToRightOf(target: THREE.Object3D, distance?: any): void;
        moveToLeftOf(target: THREE.Object3D, distance?: any): void;
        moveAbove(target: THREE.Object3D, distance?: any): void;
        moveBelow(target: THREE.Object3D, distance?: any): void;
        setOpacity(opacity: number): THREE.Object3D;
        setInvisible(): THREE.Object3D;
        setVisible(): THREE.Object3D;
    }
}
import * as Geometry from "./geometry";
import * as Animation from "./animation";
import * as Text from "./text";
import { SceneController } from "./scene";
import { setupCanvas } from "./utils";
import type { StudioScene, AnimationRepresentation } from "./scene";
import * as Diagram from "./diagram";
import * as Constants from "./constants";
import { setCameraDimensions, setCanvasViewport } from "./MeshLine/MeshLineMaterial";
export { Geometry, Animation, Text, SceneController, setupCanvas, THREE, SVGLoader, type StudioScene, type AnimationRepresentation, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport, };
