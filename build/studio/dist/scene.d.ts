import * as THREE from "three";
import { Animation } from "./animation/index.js";
import { SceneCanvasConfig } from "./utils.js";
export type AnimationRepresentation = Animation | Array<Animation> | {
    animations: Array<Animation>;
    before?: () => void;
    after?: () => void;
    parent?: THREE.Object3D;
    runTime?: number;
    scale?: number;
};
type Class<T> = new (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => T;
export interface StudioScene<T extends THREE.Camera = THREE.OrthographicCamera> {
    scene: THREE.Scene;
    camera: T;
    renderer: THREE.WebGLRenderer;
    animations?: Array<AnimationRepresentation>;
    update?: (deltaTime: number, time: number) => void;
}
export type StudioSceneClass = Class<StudioScene>;
export declare class SceneController {
    UserScene: StudioSceneClass;
    animationIndex: number;
    deltaTime: number;
    elapsedTime: number;
    firstFrame: boolean;
    fps: number;
    timePrecision: number;
    loopAnimations: Array<Animation>;
    finishedAnimationCount: number;
    userScene: StudioScene;
    viewport: THREE.Vector4 | undefined;
    aspectRatio: number;
    constructor(UserScene: StudioSceneClass, canvasRef: HTMLCanvasElement, config: SceneCanvasConfig);
    get scene(): THREE.Scene;
    get camera(): THREE.OrthographicCamera;
    get renderer(): THREE.WebGLRenderer;
    render(): void;
    tick(deltaTime: number, render?: boolean): void;
    play(): void;
}
export {};
//# sourceMappingURL=scene.d.ts.map