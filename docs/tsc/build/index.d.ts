import * as THREE from "three";
import { SVGLoader } from "./SVGLoader.js";
import * as Utils from "./utils";
declare module "three" {
    interface Object3D {
        vstack(buffer?: number): THREE.Object3D;
        vspace(distanceBetween?: number): THREE.Object3D;
        setScale(factor: number): THREE.Object3D;
        moveNextTo(target: THREE.Object3D, direction: THREE.Vector3, distance?: any): void;
        moveToRightOf(target: THREE.Object3D, distance?: any): void;
        moveToLeftOf(target: THREE.Object3D, distance?: any): void;
        moveAbove(target: THREE.Object3D, distance?: any): void;
        moveBelow(target: THREE.Object3D, distance?: any): void;
        setOpacity(opacity: number): THREE.Object3D;
        setInvisible(): THREE.Object3D;
        setVisible(config?: any): THREE.Object3D;
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
    interface Vector3 {
        rotate90(): THREE.Vector3;
        rotate180(): THREE.Vector3;
        rotate270(): THREE.Vector3;
    }
}
declare const component: (_: undefined, context: ClassFieldDecoratorContext<Object3D, Object3D> & {
    name: string;
    private: boolean;
    static: boolean;
}) => void | ((this: Object3D, value: Object3D) => Object3D);
import * as Geometry from "./geometry";
import * as Animation from "./animation";
import * as Text from "./text";
import { setupCanvas } from "./utils";
import { SceneController, type StudioScene, type AnimationRepresentation } from "./scene";
import * as Diagram from "./diagram";
import * as Constants from "./constants";
import { setCameraDimensions, setCanvasViewport } from "./MeshLine/MeshLineMaterial";
import * as Graphing from "./graphing";
import Frame from "./frame.js";
import { Object3D } from "three/src/Three.js";
export { component, Geometry, Animation, Text, SceneController, Graphing, setupCanvas, THREE, SVGLoader, type StudioScene, type AnimationRepresentation, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport, Frame, };
