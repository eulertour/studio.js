import * as Utils from "./utils";
import { Vector3 } from "three";
declare module "three" {
    interface Object3D {
        setScale(factor: number): Object3D;
        moveNextTo(target: Object3D, direction: Vector3, distance?: any): void;
        moveToRightOf(target: Object3D, distance?: any): void;
        moveToLeftOf(target: Object3D, distance?: any): void;
        moveAbove(target: Object3D, distance?: any): void;
        moveBelow(target: Object3D, distance?: any): void;
        setOpacity(opacity: number): Object3D;
        setInvisible(): Object3D;
        setVisible(): Object3D;
    }
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
export { Geometry, Animation, Text, SceneController, setupCanvas, THREE, type StudioScene, type AnimationRepresentation, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport };
