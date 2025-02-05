import { Animation } from "./Animation.js";
import * as THREE from "three";
import { getBoundingBoxCenter } from "../utils.js";
export default class MoveTo extends Animation {
    constructor(target, obj, config) {
        super((elapsedTime) => {
            obj.position
                .copy(this.start)
                .addScaledVector(this.displacement, elapsedTime);
        }, { obj, reveal: true, ...config });
        Object.defineProperty(this, "target", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: target
        });
        Object.defineProperty(this, "obj", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: obj
        });
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "displacement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    setUp() {
        super.setUp();
        this.start = this.obj.position.clone();
        const final = new THREE.Vector3();
        const initial = new THREE.Vector3();
        this.obj.parent.worldToLocal(getBoundingBoxCenter(this.target, final));
        this.obj.parent.worldToLocal(getBoundingBoxCenter(this.obj, initial));
        this.displacement = new THREE.Vector3().subVectors(final, initial);
    }
}
//# sourceMappingURL=MoveTo.js.map