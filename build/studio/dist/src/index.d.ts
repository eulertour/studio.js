import * as THREE from "three/webgpu";
import * as Utils from "./utils.js";
declare module "three/webgpu" {
    interface Object3D {
        vstack(buffer?: number): THREE.Object3D;
        vspace(distanceBetween?: number): THREE.Object3D;
        setScale(factor: number): THREE.Object3D;
        moveNextTo(target: THREE.Object3D, direction: THREE.Vector3, distance?: number): void;
        moveToRightOf(target: THREE.Object3D, distance?: number): void;
        moveToLeftOf(target: THREE.Object3D, distance?: number): void;
        moveAbove(target: THREE.Object3D, distance?: number): void;
        moveBelow(target: THREE.Object3D, distance?: number): void;
        setOpacity(opacity: number, config?: any): THREE.Object3D;
        setInvisible(config?: any): THREE.Object3D;
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
}
type ComponentParent = THREE.Object3D & {
    components?: Map<string, THREE.Object3D>;
};
declare function component(_: ClassAccessorDecoratorTarget<ComponentParent, THREE.Object3D>, context: ClassAccessorDecoratorContext<ComponentParent, THREE.Object3D>): ClassAccessorDecoratorResult<ComponentParent, any>;
import * as Animation from "./animation/index.js";
import * as Constants from "./constants.js";
import * as Diagram from "./diagram/index.js";
import * as Geometry from "./geometry/index.js";
import * as Graphing from "./graphing.js";
import Frame from "./frame.js";
import { type AnimationRepresentation, SceneController, type StudioScene } from "./scene.js";
import * as Text from "./text.js";
import { setupCanvas, SceneCanvasConfig } from "./utils.js";
import WebGPUMeshLineMaterial from "./geometry/WebGPUMeshLine/Material.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
export { component, Geometry, Animation, Text, SceneController, Graphing, setupCanvas, THREE, WebGPUMeshLineMaterial, type StudioScene, type SceneCanvasConfig, type AnimationRepresentation, Utils, Diagram, Constants, Frame, SVGLoader, TextGeometry, FontLoader, };
//# sourceMappingURL=index.d.ts.map