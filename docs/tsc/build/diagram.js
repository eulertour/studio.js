import * as THREE from "three";
import { Animation } from "./animation";
import * as Geometry from "./geometry";
import * as Utils from "./utils";
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
        }, Object.assign({ object: this }, config));
    }
}
class CongruentLine extends THREE.Group {
    constructor(ticks, start, end, config = {}) {
        config = Object.assign({ tickLength: 0.25, spacing: 0.15 }, config);
        super();
        const left = -(config.spacing * (ticks - 1)) / 2;
        for (let i = 0; i < ticks; i++) {
            const pos = left + config.spacing * i;
            const tick = new Geometry.Line(new THREE.Vector3(pos, -config.tickLength / 2, 0), new THREE.Vector3(pos, config.tickLength / 2, 0), config);
            this.add(tick);
        }
        const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
        this.position.copy(center);
        const segmentVector = new THREE.Vector3().subVectors(end, start);
        this.rotation.z = Math.atan2(segmentVector.y, segmentVector.x);
        return this;
    }
}
class CongruentAngle extends THREE.Group {
    constructor(arcs, point1, point2, point3, config = {}) {
        config = Object.assign({ minRadius: 0.4, spacing: 0.15 }, config);
        super();
        this.config = config;
        for (let i = 0; i < arcs; i++) {
            const arc = Geometry.Arc.asAngle(point1, point2, point3, Object.assign({ radius: config.minRadius + i * config.spacing }, config));
            this.add(arc);
        }
    }
}
export { Indicator, CongruentLine, CongruentAngle };
//# sourceMappingURL=diagram.js.map