import Shape from "./Shape.js";
import { getArcPoints } from "./geometryUtils.js";
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
export default class Circle extends Shape {
    constructor(radius = 1, config = {}) {
        const points = getArcPoints(radius, 2 * Math.PI);
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