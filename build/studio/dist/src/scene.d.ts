import * as THREE from "three/webgpu";
import { Animation } from "./animation/index.js";
import { SceneCanvasConfig } from "./utils.js";
export type AnimationRepresentation = Animation | Array<Animation> | {
    animations: Array<Animation>;
    before?: () => void;
    after?: () => void;
    parent?: THREE.Object3D;
    runTime?: number;
    scale?: number;
} | ((t: number, dt: number) => void);
type Class<T> = new (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGPURenderer) => T;
export interface StudioScene<T extends THREE.Camera = THREE.OrthographicCamera> {
    scene: THREE.Scene;
    camera: T;
    renderer: THREE.WebGPURenderer;
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
    private _viewport;
    aspectRatio: number;
    constructor(UserScene: StudioSceneClass, canvasRef: HTMLCanvasElement, config: SceneCanvasConfig);
    get viewport(): THREE.Vector4 | undefined;
    set viewport(value: THREE.Vector4 | undefined);
    get scene(): THREE.Scene;
    get camera(): THREE.OrthographicCamera;
    get renderer(): THREE.WebGPURenderer;
    render(): void;
    tick(deltaTime: number, render?: boolean): void;
    play(): void;
}
export {};
//# sourceMappingURL=scene.d.ts.map