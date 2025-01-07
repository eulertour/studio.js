import Arc from "./arc.js";
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
export default class Circle extends Arc {
    constructor(radius = 1, config = {}) {
        super(radius, 2 * Math.PI, {
            ...Circle.defaultConfig(),
            ...config,
        });
    }
    reshape(radius, config = {}) {
        this.radius = radius;
        this.copyStrokeFill(new Circle(radius, config));
    }
    static defaultConfig() {
        return { ...Arc.defaultConfig(), fill: true };
    }
    getCloneAttributes() {
        return [this.radius];
    }
    getAttributes() {
        return {
            radius: this.radius,
            angle: 2 * Math.PI,
            closed: false,
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
//# sourceMappingURL=circle.js.map