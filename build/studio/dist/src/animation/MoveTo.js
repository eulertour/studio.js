import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";
import { getBoundingBoxCenter } from "../utils.js";
export default class MoveTo extends Animation {
    constructor(obj, target, config) {
        super((elapsedTime) => {
            obj.position
                .copy(this.start)
                .addScaledVector(this.displacement, elapsedTime);
        }, { obj, reveal: true, ...config });
        Object.defineProperty(this, "obj", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: obj
        });
        Object.defineProperty(this, "target", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: target
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
        final.copy(this.target);
        getBoundingBoxCenter(this.obj, initial);
        this.obj.parent?.worldToLocal(final);
        this.obj.parent?.worldToLocal(initial);
        this.displacement = new THREE.Vector3().subVectors(final, initial);
    }
}
/*

Example Usage:

 new Animation.MoveTo(triangle, new THREE.Vector3(4, 1, 0));

 new Animation.MoveTo(triangle, diagram.square.position);

*/ 
//# sourceMappingURL=MoveTo.js.map