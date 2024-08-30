import * as THREE from "three";
import { Animation } from "./animation";
import * as Geometry from "./geometry";
import { OUT } from "./utils";
class Indicator extends THREE.Group {
    constructor(start, end, config = {}) {
        const { tickLength = 0.4 } = config;
        super();
        this.start = start;
        this.end = end;
        this.stem = Geometry.Line.centeredLine(start, end, config);
        const tickVector = new THREE.Vector3()
            .subVectors(end, start)
            .normalize()
            .applyAxisAngle(OUT, Math.PI / 2)
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
        }, Object.assign({ object: this }, config));
    }
}
class Congruent extends THREE.Group {
    constructor(ticks, config = {}) {
        config = Object.assign({ tickLength: 0.25, spacing: 0.3 }, config);
        super();
        this.ticks = ticks;
        const left = (-config.spacing * (ticks - 1)) / 4;
        for (let i = 0; i < ticks; i++) {
            const pos = left + 0.5 * config.spacing * i;
            const tick = new Geometry.Line(new THREE.Vector3(pos, -config.tickLength / 2, 0), new THREE.Vector3(pos, config.tickLength / 2, 0), config);
            this.add(tick);
        }
    }
    moveToSegment(start, end) {
        const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
        this.position.copy(center);
        const segmentVector = new THREE.Vector3().subVectors(end, start);
        this.rotation.z = Math.atan2(segmentVector.y, segmentVector.x);
        return this;
    }
}
export { Indicator, Congruent };
//# sourceMappingURL=diagram.js.map