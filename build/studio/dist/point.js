import Circle from "./circle.js";
import { THREE } from "./index.js";
import { ORIGIN } from "./utils.js";
/**
 * A small circle representing a precise location in space.
 *
 * @example point.ts
 */
export default class Point extends Circle {
    constructor(position = ORIGIN, config = {}) {
        config = {
            fillColor: new THREE.Color("black"),
            fillOpacity: 1,
            ...Point.defaultConfig(),
            ...config,
        };
        super(config.radius, config);
        this.position.set(position.x, position.y, 0);
    }
    static defaultConfig() {
        return { ...Circle.defaultConfig(), radius: 0.08 };
    }
    getAttributes() {
        return {
            radius: this.radius,
            angle: 2 * Math.PI,
            closed: false,
        };
    }
    static fromAttributes() {
        return new Point(new THREE.Vector3());
    }
}
//# sourceMappingURL=point.js.map