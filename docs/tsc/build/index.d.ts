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
        recenter(center: THREE.Vector3): THREE.Object3D;
        reorient(zRotation: number): void;
        pointAlongCurve(t: number): THREE.Vector3;
        addComponent<T extends THREE.Object3D, K extends string>(name: K, child: T): this & {
            [P in K]: T;
        };
        updateComponent(name: string, child: THREE.Object3D): void;
        removeComponent(name: string): THREE.Object3D;
        hideComponents(): THREE.Object3D;
        revealComponents(): THREE.Object3D;
        hide(): THREE.Object3D;
        reveal(): THREE.Object3D;
        isHidden(): boolean;
        isRevealed(): boolean;
        isComponent(): boolean;
        revealDescendants(config?: {
            includeSelf: boolean;
        }): this;
        hideDescendants(config?: {
            includeSelf: boolean;
        }): THREE.Object3D;
        revealAncestors(config?: {
            includeSelf: boolean;
        }): THREE.Object3D;
        hideAncestors(config?: {
            includeSelf: boolean;
        }): THREE.Object3D;
        revealLineage(): THREE.Object3D;
        hideLineage(): THREE.Object3D;
        traverseComponents(f: () => void, config?: {
            includeSelf: boolean;
        }): void;
        traverseAncestorComponents(f: () => void, config?: {
            includeSelf: boolean;
        }): void;
    }
    interface Vector3 {
        rotate90(): THREE.Vector3;
        rotate180(): THREE.Vector3;
        rotate270(): THREE.Vector3;
        transformBetweenSpaces(from: THREE.Object3D, to: THREE.Object3D): THREE.Vector3;
    }
}
type ComponentParent = THREE.Object3D & {
    components?: Map<string, THREE.Object3D>;
};
declare function component(_: ClassAccessorDecoratorTarget<ComponentParent, THREE.Object3D>, context: ClassAccessorDecoratorContext<ComponentParent, THREE.Object3D>): ClassAccessorDecoratorResult<ComponentParent, any>;
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
export { component, Geometry, Animation, Text, SceneController, Graphing, setupCanvas, THREE, SVGLoader, type StudioScene, type AnimationRepresentation, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport, Frame, };
