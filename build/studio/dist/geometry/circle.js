import { ERROR_THRESHOLD } from "../constants.js";
import Shape from "./Shape.js";
import * as THREE from "three/webgpu";
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
export default class Circle extends Shape {
    constructor(radius = 1, config = {}) {
        const angle = 2 * Math.PI;
        let points = [];
        for (let i = 0; i < angle + ERROR_THRESHOLD; i += angle / 50) {
            points.push(new THREE.Vector3(radius * Math.cos(i), radius * Math.sin(i), 0));
        }
        points.push(points[0].clone());
        super(points, {
            ...Circle.defaultConfig(),
            ...config,
        });
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radius
        });
    }
    reshape(radius, config = {}) {
        this.radius = radius;
        this.copyStrokeAndFill(new Circle(radius, config));
    }
    getCloneAttributes() {
        return [this.radius];
    }
    getAttributes() {
        return {
            radius: this.radius,
        };
    }
    static fromAttributes(attributes) {
        const { radius } = attributes;
        return new Circle(radius);
    }
    get attributeData() {
        return [
            {
                attribute: "radius",
                type: "number",
                default: 1,
            },
        ];
    }
}
//# sourceMappingURL=Circle.js.map