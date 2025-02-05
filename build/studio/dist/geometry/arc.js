import Shape from "./Shape.js";
import { THREE } from "../index.js";
import { getArcPoints } from "./geometryUtils.js";
/**
 * An arc.
 *
 * @example arc.ts
 */
export default class Arc extends Shape {
    constructor(radius = 1, angle = Math.PI / 2, config = {}) {
        config = { ...Arc.defaultConfig(), ...config };
        let points = getArcPoints(radius, angle, { closed: config.closed });
        super(points, config);
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radius
        });
        Object.defineProperty(this, "angle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: angle
        });
        Object.defineProperty(this, "closed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.closed = config.closed ?? false;
        if (this.closed) {
            this.curveEndIndices = [
                [0, 1],
                [1, points.length - 2],
                [points.length - 2, points.length - 1],
            ];
        }
        else {
            this.curveEndIndices = [[0, points.length - 1]];
        }
    }
    reshape(radius = 1, angle = Math.PI / 2, config = {}) {
        this.radius = radius;
        this.angle = angle;
        this.copyStrokeFill(new Arc(radius, angle, config));
    }
    getCloneAttributes() {
        return [this.radius, this.angle, this.closed];
    }
    getAttributes() {
        return {
            radius: this.radius,
            angle: this.angle,
            closed: this.closed,
        };
    }
    static fromAttributes(attributes) {
        const { radius, angle, closed } = attributes;
        return new Arc(radius, angle, { closed });
    }
    get attributeData() {
        return [
            {
                attribute: "radius",
                type: "number",
                default: 1,
            },
            {
                attribute: "angle",
                type: "angle",
                default: 45,
            },
            {
                attribute: "closed",
                type: "boolean",
                default: false,
            },
        ];
    }
    getDimensions() {
        const worldDiameter = 2 * this.radius * this.scale.x;
        return new THREE.Vector2(worldDiameter, worldDiameter);
    }
}
//# sourceMappingURL=Arc.js.map