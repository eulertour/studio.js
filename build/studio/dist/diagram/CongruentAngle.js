import * as THREE from "three";
import Angle from "./Angle.js";
export default class CongruentAngle extends THREE.Group {
    constructor(arcs, point1, point2, point3, config = {}) {
        config = {
            minRadius: 0.4,
            spacing: 0.15,
            ...config,
        };
        super();
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        for (let i = 0; i < arcs; i++) {
            const arc = new Angle(point1, point2, point3, {
                radius: config.minRadius + i * config.spacing,
                ...config,
            });
            this.add(arc);
        }
    }
}
//# sourceMappingURL=CongruentAngle.js.map