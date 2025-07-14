import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";
export default class FadeOut extends Animation {
    config?: any;
    initialOpacity: Map<any, any>;
    constructor(objectOrFunc: THREE.Object3D | (() => THREE.Object3D), config?: any);
    setUp(): void;
    tearDown(): void;
}
//# sourceMappingURL=FadeOut.d.ts.map