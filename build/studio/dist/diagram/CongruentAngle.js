import * as THREE from "three";
import Angle from "./Angle.js";
import Shape from "../geometry/Shape.js";
export default class CongruentAngle extends Shape {
    constructor(arcs, point1, point2, point3, config = {}) {
        config = {
            minRadius: 0.4,
            spacing: 0.15,
            ...config,
        };
        super();
        Object.defineProperty(this, "arcs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: arcs
        });
        Object.defineProperty(this, "point1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point1
        });
        Object.defineProperty(this, "point2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point2
        });
        Object.defineProperty(this, "point3", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point3
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        this.intrinsicChildren = new THREE.Group();
        for (let i = 0; i < arcs; i++) {
            const arc = new Angle(point1, point2, point3, {
                radius: config.minRadius + i * config.spacing,
                ...config,
            });
            this.intrinsicChildren.add(arc);
        }
        this.add(this.intrinsicChildren);
    }
    getAttributes() {
        return {
            arcs: this.arcs,
            point1: this.point1,
            point2: this.point2,
            point3: this.point3,
        };
    }
}
//# sourceMappingURL=CongruentAngle.js.map