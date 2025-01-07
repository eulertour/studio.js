import * as THREE from "three";
import { MeshLine } from "./MeshLine/index.js";
import { ERROR_THRESHOLD } from "./constants.js";
import { ORIGIN } from "./utils.js";
import Shape from "./shape.js";
import Line from "./line.js";
import Arrow from "./arrow.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";
/**
 * A part of a circle's circumference.
 *
 * @example arc.ts
 */
class Arc extends Shape {
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
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
class Circle extends Arc {
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
/**
 * A small circle representing a precise location in space.
 *
 * @example point.ts
 */
class Point extends Circle {
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