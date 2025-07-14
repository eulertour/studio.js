import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";
export default class MoveTo extends Animation {
    target: THREE.Object3D;
    obj: THREE.Object3D;
    start: any;
    displacement: any;
    constructor(target: THREE.Object3D, obj: THREE.Object3D, config?: any);
    setUp(): void;
}
//# sourceMappingURL=MoveTo.d.ts.map