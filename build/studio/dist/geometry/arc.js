import Shape from "./shape.js";
import { THREE } from "../index.js";
import { ERROR_THRESHOLD } from "../constants.js";
export default class Arc extends Shape {
    constructor(radius = 1, angle = Math.PI / 2, config = {}) {
        config = { ...Arc.defaultConfig(), ...config };
        let points = [];
        let negative = false;
        if (angle < 0) {
            negative = true;
            angle *= -1;
        }
        if (angle > 0) {
            for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
                points.push(new THREE.Vector3(radius * Math.cos(i), radius * Math.sin(i) * (negative ? -1 : 1), 0));
            }
        }
        else {
            points.push(new THREE.Vector3(radius, 0, 0), new THREE.Vector3(radius, 0, 0));
        }
        if (config.closed) {
            points = [
                new THREE.Vector3(0, 0, 0),
                ...points,
                new THREE.Vector3(0, 0, 0),
            ];
        }
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
        this.closed = config.closed;
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
    static defaultConfig() {
        return { ...Shape.defaultConfig(), closed: false, fill: false };
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
//# sourceMappingURL=arc.js.map