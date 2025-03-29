import { Animation, AnimationConfig } from "./Animation.js";
import * as THREE from "three";
type FadeInConfig = {
    includeDescendants?: boolean;
    concealAncestors?: boolean;
} & ({
    preserveOpacity?: boolean;
} | {
    targetOpacity?: number | {
        stroke?: number;
        fill?: number;
    };
});
type Config = AnimationConfig & FadeInConfig;
export default class FadeIn extends Animation {
    object: THREE.Object3D;
    private OpacityTargetMode;
    config: Config;
    private targetOpacities;
    constructor(object: THREE.Object3D, userConfig?: Config);
    setUp(): void;
    static defaultConfig(): FadeInConfig;
    private setTargetOpacities;
    private setTargetOpacityFromConfig;
    private getMeshes;
    private concealAncestors;
    private getOpacityTargetMode;
    private getMaterial;
}
export {};
//# sourceMappingURL=FadeIn.d.ts.map