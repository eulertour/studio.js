import { ERROR_THRESHOLD } from "../constants.js";
import Shape from "./Shape.js";
import * as THREE from "three";
export default class Ellipse extends Shape {
    constructor(radiusA = 2, radiusB = 1, config = {}) {
        const angle = 2 * Math.PI;
        let points = [];
        for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
            const angle = i;
            const x = radiusA * Math.cos(angle);
            const y = radiusB * Math.sin(angle);
            points.push(new THREE.Vector3(x, y, 0));
        }
        super(points, {
            ...Ellipse.defaultConfig(),
            ...config,
        });
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
    }
    reshape(radiusA, radiusB, config = {}) {
        this.radiusA = radiusA;
        this.radiusB = radiusB;
        this.copyStrokeAndFill(new Ellipse(radiusA, radiusB, config));
    }
    getCloneAttributes() {
        return [this.radiusA, this.radiusB];
    }
    getAttributes() {
        return {
            radiusA: this.radiusA,
            radiusB: this.radiusB,
        };
    }
    static fromAttributes(attributes) {
        const { radiusA, radiusB } = attributes;
        return new Ellipse(radiusA, radiusB);
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
        ];
    }
}
//# sourceMappingURL=Ellipse.js.map