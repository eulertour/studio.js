import { THREE } from "../index.js";
export declare const applyEasing: (t: number, dt: number, easingFunction: (_: number) => number) => [number, number];
export type AnimationConfig = {
    object?: THREE.Object3D;
    parent?: THREE.Object3D;
    before?: () => void;
    after?: () => void;
    family?: boolean;
    reveal?: boolean;
    hide?: boolean;
    easing?: (_: number) => number;
};
declare class Animation {
    func: (elapsedTime: number, deltaTime: number) => void;
    scene: any;
    startTime: number;
    endTime: number;
    prevUpdateTime: number;
    beforeFunc: () => void;
    afterFunc: () => void;
    parent: THREE.Object3D<THREE.Object3DEventMap> | undefined;
    object: THREE.Object3D<THREE.Object3DEventMap> | undefined;
    before: (() => void) | undefined;
    after: (() => void) | undefined;
    family: boolean | undefined;
    reveal: boolean | undefined;
    hide: boolean | undefined;
    scale: number;
    runTime: number;
    finished: boolean;
    elapsedSinceStart: number;
    easing: (_: number) => number;
    constructor(func: (elapsedTime: number, deltaTime: number) => void, config?: AnimationConfig);
    setUp(): void;
    tearDown(): void;
    update(worldTime: any): void;
    addBefore(before: any): void;
    addAfter(after: any): void;
}
export { Animation };
//# sourceMappingURL=Animation.d.ts.map