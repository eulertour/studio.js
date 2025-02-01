import * as THREE from "three";
import { Animation } from "./animation.js";
import { SceneCanvasConfig } from "./utils.js";
type Class<T> = new (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => T;
export type AnimationRepresentation = Animation | Array<Animation> | {
    animations: Array<Animation>;
    before?: () => void;
    after?: () => void;
    parent?: THREE.Object3D;
    runTime?: number;
    scale?: number;
};
export interface StudioScene<T extends THREE.Camera = THREE.OrthographicCamera> {
    scene: THREE.Scene;
    camera: T;
    renderer: THREE.WebGLRenderer;
    animations?: Array<AnimationRepresentation>;
    update?: (deltaTime: number, time: number) => void;
}
export declare class SceneController {
    UserScene: Class<StudioScene>;
    animationIndex: number;
    deltaTime: number;
    elapsedTime: number;
    firstFrame: boolean;
    paused: boolean;
    fps: number;
    timePrecision: number;
    startTime: number;
    endTime: number;
    loopAnimations: Array<Animation>;
    finishedAnimationCount: number;
    userScene: StudioScene;
    three: typeof THREE;
    viewport: THREE.Vector4;
    aspectRatio: number;
    constructor(UserScene: Class<StudioScene>, canvasRef: HTMLCanvasElement, config: SceneCanvasConfig);
    get scene(): THREE.Scene;
    get camera(): THREE.OrthographicCamera;
    get renderer(): THREE.WebGLRenderer;
    render(): void;
    tick(deltaTime: number, render?: boolean): void;
    play(): void;
    pause(): void;
    dispose(): void;
}
export {};
//# sourceMappingURL=scene.d.ts.map