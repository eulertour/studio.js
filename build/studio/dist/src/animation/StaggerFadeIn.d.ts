import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";
export default class Stagger extends Animation {
    private objects;
    private initialOpacities;
    private duration;
    private staggerDelay;
    /**
     * Creates a staggered fade-in animation for multiple objects
     * @param objects Array of objects to animate in sequence
     * @param config Additional configuration options
     */
    constructor(objects: THREE.Object3D[], config?: {
        duration?: number;
    });
    setUp(): void;
}
//# sourceMappingURL=StaggerFadeIn.d.ts.map