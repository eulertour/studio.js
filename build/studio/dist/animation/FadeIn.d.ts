import { Animation } from "./Animation.js";
import * as THREE from "three";
type FadeInConfig = {
    duration?: number;
    family?: boolean;
    preserveOpacity?: boolean;
    targetOpacity?: {
        fillOpacity?: number;
        strokeOpacity?: number;
    };
};
export default class FadeIn extends Animation {
    initialOpacity: Map<any, any>;
    private preserveOpacity;
    private targetFillOpacity?;
    private targetStrokeOpacity?;
    constructor(object: THREE.Object3D, config?: FadeInConfig);
    setUp(): void;
}
export {};
//# sourceMappingURL=FadeIn.d.ts.map