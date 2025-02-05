import { Animation } from "./Animation.js";
import * as THREE from "three";
export default class Emphasize extends Animation {
    initialScale: number;
    largeScale: number;
    keyframe: number;
    constructor(object: THREE.Object3D, largeScale?: number, config?: any);
    setUp(): void;
}
//# sourceMappingURL=Emphasize.d.ts.map