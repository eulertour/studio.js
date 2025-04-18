import Shape from "./Shape.js";
import { THREE } from "../index.js";
import { getEllipseArcPoints } from "./geometryUtils.js";
import Arc from "./Arc.js";
/**
 * EllipseArc
 *
 * @example ellipseArc.ts
 */
export default class EllipseArc extends Shape {
    constructor(radiusA = 1, radiusB = 2, angle = Math.PI / 2, config = {}) {
        config = { ...Arc.defaultConfig(), ...config };
        let points = getEllipseArcPoints(radiusA, radiusB, angle, { closed: config.closed });
        super(points, config);
        Object.defineProperty(this, "radiusA", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radiusA
        });
        Object.defineProperty(this, "radiusB", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radiusB
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
    reshape(radiusA = 1, radiusB = 2, angle = Math.PI / 2, config = {}) {
        this.radiusA = radiusA;
        this.radiusB = radiusB;
        this.angle = angle;
        this.copyStrokeAndFill(new EllipseArc(radiusA, radiusB, angle, config));
    }
    getCloneAttributes() {
        return [this.radiusA, this.radiusB, this.angle, this.closed];
    }
    getAttributes() {
        return {
            radiusA: this.radiusA,
            radiusB: this.radiusB,
            angle: this.angle,
            closed: this.closed,
        };
    }
    static fromAttributes(attributes) {
        const { radiusA, radiusB, angle, closed } = attributes;
        return new EllipseArc(radiusA, radiusB, angle, { closed });
    }
    get attributeData() {
        return [
            {
                attribute: "radiusA",
                type: "number",
                default: 1,
            },
            {
                attribute: "radiusB",
                type: "number",
                default: 2,
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
        const worldDiameter = 2 * this.radiusB * this.scale.x;
        return new THREE.Vector2(worldDiameter, worldDiameter);
    }
}
//# sourceMappingURL=EllipseArc.js.map