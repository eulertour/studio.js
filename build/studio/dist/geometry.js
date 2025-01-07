import * as THREE from "three";
import { MeshLine } from "./MeshLine/index.js";
import Shape from "./shape.js";
import Line from "./line.js";
import Arrow from "./arrow.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";
import Arc from "./arc.js";
import Circle from "./circle.js";
import Point from "./point.js";
/**
 * A shape with four sides and four right angles.
 *
 * @example rectangle.ts
 */
class Rectangle extends Shape {
    constructor(width = 4, height = 2, config = {}) {
        super([
            new THREE.Vector3(-width / 2, height / 2, 0),
            new THREE.Vector3(width / 2, height / 2, 0),
            new THREE.Vector3(width / 2, -height / 2, 0),
            new THREE.Vector3(-width / 2, -height / 2, 0),
            new THREE.Vector3(-width / 2, height / 2, 0),
        ], { ...Rectangle.defaultConfig(), ...config });
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: width
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: height
        });
    }
    getCloneAttributes() {
        return [this.width, this.height];
    }
    getAttributes() {
        return {
            width: this.width,
            height: this.height,
        };
    }
    static fromAttributes(attributes) {
        const { width, height } = attributes;
        return new Rectangle(width, height);
    }
    get attributeData() {
        return [
            {
                attribute: "width",
                type: "number",
                default: 4,
            },
            {
                attribute: "height",
                type: "number",
                default: 2,
            },
        ];
    }
    getCurveEndIndices() {
        return [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
        ];
    }
}
/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
class Square extends Rectangle {
    constructor(sideLength = 2, config = {}) {
        super(sideLength, sideLength, { ...Square.defaultConfig(), ...config });
        Object.defineProperty(this, "sideLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: sideLength
        });
    }
    reshape(sideLength, config = {}) {
        this.sideLength = sideLength;
        this.copyStrokeFill(new Square(sideLength, config));
    }
    getCloneAttributes() {
        return [this.sideLength];
    }
    getAttributes() {
        return {
            width: this.sideLength,
            height: this.sideLength,
        };
    }
    static fromAttributes(attributes) {
        const { width } = attributes;
        return new Square(width);
    }
    get attributeData() {
        return [
            {
                attribute: "sideLength",
                type: "number",
                default: 2,
            },
        ];
    }
}
export { Shape, Line, Arrow, Point, Circle, Arc, Polygon, Polyline, Rectangle, Square, MeshLine, };
//# sourceMappingURL=geometry.js.map