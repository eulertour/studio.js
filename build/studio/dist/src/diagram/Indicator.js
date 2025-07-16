import * as THREE from "three/webgpu";
import * as Geometry from "../geometry/index.js";
import * as Utils from "../utils.js";
import { Animation } from "../animation/index.js";
export default class Indicator extends THREE.Group {
    constructor(start, end, config = {}) {
        const { tickLength = 0.4 } = config;
        super();
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: start
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: end
        });
        Object.defineProperty(this, "startTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.stem = Geometry.Line.centeredLine(start, end, config);
        const tickVector = new THREE.Vector3()
            .subVectors(end, start)
            .normalize()
            .applyAxisAngle(Utils.OUT, Math.PI / 2)
            .multiplyScalar(tickLength / 2);
        const negativeTickVector = tickVector.clone().multiplyScalar(-1);
        this.startTick = Geometry.Line.centeredLine(new THREE.Vector3().addVectors(start, tickVector), new THREE.Vector3().addVectors(start, negativeTickVector), config);
        this.endTick = Geometry.Line.centeredLine(new THREE.Vector3().addVectors(end, tickVector), new THREE.Vector3().addVectors(end, negativeTickVector), config);
        const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
        for (const mesh of [this.stem, this.startTick, this.endTick]) {
            mesh.position.sub(center);
            this.add(mesh);
        }
        this.position.copy(center);
    }
    grow(config) {
        const vec = new THREE.Vector3().subVectors(this.end, this.start);
        this.startTick.position.set(0, 0, 0);
        this.endTick.position.set(0, 0, 0);
        this.stem.stroke.material.uniforms.drawRange.value.set(0.5, 0.5);
        return new Animation((elapsedTime) => {
            const halfTime = elapsedTime / 2;
            this.stem.stroke.material.uniforms.drawRange.value.set(0.5 - halfTime, 0.5 + halfTime);
            this.startTick.position.set(0, 0, 0).addScaledVector(vec, halfTime);
            this.endTick.position.set(0, 0, 0).addScaledVector(vec, -halfTime);
        }, { object: this, ...config });
    }
}
//# sourceMappingURL=Indicator.js.map