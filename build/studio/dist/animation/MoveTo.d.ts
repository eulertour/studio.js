import { Animation } from "./Animation.js";
import * as THREE from "three";
export default class MoveTo extends Animation {
    obj: THREE.Object3D;
    target: THREE.Vector3;
    start: THREE.Vector3;
    displacement: THREE.Vector3;
    constructor(obj: THREE.Object3D, target: THREE.Vector3, config?: any);
    setUp(): void;
}
//# sourceMappingURL=MoveTo.d.ts.map