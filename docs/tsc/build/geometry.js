import * as THREE from "three";
import { ERROR_THRESHOLD } from "./constants";
import { MeshLine, MeshLineGeometry, MeshLineMaterial } from "./MeshLine";
import { ORIGIN } from "./utils";
import { Utils } from "src";
const getFillGeometry = (points) => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
        shape.lineTo(point.x, point.y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
};
/**
 * An abstract class representing a generalized shape.
 */
class Shape extends THREE.Group {
    constructor(points, config = {}) {
        super();
        config = Object.assign(Shape.defaultStyle(), config);
        if (config.fill !== false) {
            const fillGeometry = getFillGeometry(points);
            const fillMaterial = new THREE.MeshBasicMaterial({
                color: config.fillColor,
                opacity: config.fillOpacity,
                transparent: true,
                side: THREE.DoubleSide,
            });
            this.fill = new THREE.Mesh(fillGeometry, fillMaterial);
            this.add(this.fill);
        }
        if (config.stroke !== false) {
            const strokeGeometry = new MeshLineGeometry(config.arrow);
            strokeGeometry.setPoints(points);
            const strokeMaterial = new MeshLineMaterial({
                color: config.strokeColor,
                opacity: config.strokeOpacity,
                width: config.strokeWidth,
                transparent: true,
            });
            this.stroke = new MeshLine(strokeGeometry, strokeMaterial);
            this.add(this.stroke);
        }
        this.curveEndIndices = this.getCurveEndIndices();
    }
    static defaultStyle() {
        return {
            strokeColor: new THREE.Color(0x000000),
            strokeOpacity: 1.0,
            strokeWidth: 4,
            fillColor: new THREE.Color(0xfffaf0),
            fillOpacity: 0.0,
        };
    }
    static defaultConfig() {
        return {};
    }
    reshape(...args) {
        throw new Error("Reshape not implemented.");
    }
    copyStroke(shape) {
        this.stroke.geometry.dispose();
        this.stroke.geometry = shape.stroke.geometry;
    }
    copyFill(shape) {
        this.fill.geometry.dispose();
        this.fill.geometry = shape.fill.geometry;
    }
    copyStrokeFill(shape) {
        this.copyStroke(shape);
        this.copyFill(shape);
    }
    get points() {
        return this.stroke.geometry.points;
    }
    worldPoint(index) {
        return this.localToWorld(this.points[index].clone());
    }
    transformedPoint(index, targetSpace) {
        const startingPoint = this.points[index].clone();
        return Utils.transformBetweenSpaces(this, targetSpace, startingPoint);
    }
    segment(index) {
        return new THREE.Line3(this.points[index].clone(), this.points[index + 1].clone());
    }
    curve(curveIndex, worldTransform = true) {
        const curveEndIndices = this.curveEndIndices[curveIndex];
        const curvePoints = this.points.slice(curveEndIndices[0], curveEndIndices[1] + 1);
        if (worldTransform) {
            return curvePoints.map((p) => p.clone().applyMatrix4(this.matrixWorld));
        }
        else {
            return curvePoints;
        }
    }
    get numCurves() {
        return this.curveEndIndices.length;
    }
    getCurveEndIndices() {
        const points = this.stroke.geometry.points;
        const indices = [];
        for (let i = 0; i < points.length - 1; i++) {
            indices.push([i, i + 1]);
        }
        return indices;
    }
    clear() {
        this.remove(this.stroke);
        this.remove(this.fill);
        return this;
    }
    clone(recursive) {
        if (recursive === true) {
            throw Error("Recursive Shape.clone() isn't implemented.");
        }
        const cloneFunc = this.constructor;
        const clone = new cloneFunc(...this.getCloneAttributes(), Object.assign(Object.assign({}, this.getStyle()), this.getClassConfig()));
        THREE.Object3D.prototype.copy.call(clone, this, false);
        return clone;
    }
    getClassConfig() {
        return {};
    }
    getCloneAttributes() {
        return [this.points];
    }
    getStyle() {
        return {
            fillColor: this.fill.material.color,
            fillOpacity: this.fill.material.opacity,
            strokeColor: this.stroke.material.color,
            strokeOpacity: this.stroke.material.opacity,
            strokeWidth: this.stroke.material.width,
        };
    }
    setStyle(style) {
        const { fillColor, fillOpacity } = style;
        if (fillColor !== undefined) {
            this.fill.material.color = fillColor;
        }
        if (fillOpacity !== undefined) {
            this.fill.material.opacity = fillOpacity;
        }
        const { strokeColor, strokeOpacity, strokeWidth } = style;
        if (strokeColor !== undefined) {
            this.stroke.material.color = strokeColor;
        }
        if (strokeOpacity !== undefined) {
            this.stroke.material.opacity = strokeOpacity;
        }
        if (strokeWidth !== undefined) {
            this.stroke.material.width = strokeWidth;
        }
    }
    getTransform() {
        return {
            position: this.position.clone(),
            rotation: this.rotation.clone(),
            scale: this.scale.clone(),
        };
    }
    setTransform(transform) {
        const { position, rotation, scale } = transform;
        this.position.copy(position);
        this.rotation.copy(rotation);
        this.scale.copy(scale);
    }
    dispose() {
        this.fill.geometry.dispose();
        this.fill.material.dispose();
        this.stroke.geometry.dispose();
        this.stroke.material.dispose();
        return this;
    }
    getDimensions() {
        const box = new THREE.Box3();
        box.setFromObject(this);
        const width = box.max.x - box.min.x;
        const height = box.max.y - box.min.y;
        return new THREE.Vector2(width, height);
    }
    closestPointToPoint(point, target) {
        if (target === undefined) {
            target = new THREE.Vector3();
        }
        const segment = new THREE.Line3();
        const closestPointOnSegment = new THREE.Vector3();
        let minDistance = Infinity;
        for (let i = 0; i < this.points.length - 1; i++) {
            segment.set(this.points[i], this.points[i + 1]);
            const distance = segment
                .closestPointToPoint(point, true, closestPointOnSegment)
                .distanceTo(point);
            if (distance < minDistance) {
                minDistance = distance;
                target.copy(closestPointOnSegment);
            }
        }
        return target;
    }
}
/**
 * A segment between two points.
 *
 * @example line.ts
 */
class Line extends Shape {
    constructor(start, end, config = {}) {
        config = Object.assign(Object.assign({}, Line.defaultConfig()), config);
        super([start, end], config);
        this.start = start;
        this.end = end;
        this.arrow = config.arrow;
        this.curveEndIndices = [[0, 1]];
    }
    static defaultConfig() {
        return Object.assign(Object.assign({}, super.defaultConfig()), { arrow: false });
    }
    static centeredLine(start, end, config = {}) {
        const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
        const line = new Line(new THREE.Vector3().subVectors(start, center), new THREE.Vector3().subVectors(end, center), config);
        line.position.copy(center);
        return line;
    }
    reshape(start, end, config = {}) {
        this.start.copy(start);
        this.end.copy(end);
        this.copyStrokeFill(new Line(start, end, config));
    }
    getClassConfig() {
        return {};
    }
    getAttributes() {
        return {
            start: this.start,
            end: this.end,
        };
    }
    getVector(global = false) {
        this.updateWorldMatrix(true, false);
        return global
            ? new THREE.Vector3().subVectors(new THREE.Vector3().copy(this.end).applyMatrix4(this.matrixWorld), new THREE.Vector3().copy(this.start).applyMatrix4(this.matrixWorld))
            : new THREE.Vector3().subVectors(this.end, this.start);
    }
    static fromAttributes(attributes) {
        const { start, end } = attributes;
        return new Line(start, end);
    }
}
/**
 * An arrow derived from a line.
 *
 * @example arrow.ts
 */
class Arrow extends Line {
    constructor(start, end, config = {}) {
        super(start, end, Object.assign(Object.assign(Object.assign({}, Arrow.defaultConfig()), config), { arrow: true }));
        this.start = start;
        this.end = end;
    }
    reshape(start, end, config = {}) {
        this.start.copy(start);
        this.end.copy(end);
        this.copyStrokeFill(new Arrow(start, end, config));
    }
}
/**
 * A series of connected line segments.
 *
 * @example polyline.ts
 */
class Polyline extends Shape {
    constructor(points, config = {}) {
        super(points, Object.assign(Object.assign(Object.assign({}, Polyline.defaultConfig()), config), { fillOpacity: 0 }));
        this.curveEndIndices = [[0, 1]];
    }
    reshape(points, config = {}) {
        this.copyStrokeFill(new Polyline(points, config));
    }
    static defaultConfig() {
        return Object.assign(Object.assign({}, super.defaultConfig()), { fill: false });
    }
    getClassConfig() {
        return {};
    }
    getAttributes() {
        return {
            points: this.points,
        };
    }
    static asRightAngle(point1, point2, point3, config = {}) {
        config = Object.assign({ sideLength: 0.35 }, config);
        const vector21 = new THREE.Vector3()
            .subVectors(point1, point2)
            .setLength(config.sideLength);
        const vector23 = new THREE.Vector3()
            .subVectors(point3, point2)
            .setLength(config.sideLength);
        return new Polyline([
            new THREE.Vector3().addVectors(point2, vector21),
            new THREE.Vector3().add(point2).add(vector21).add(vector23),
            new THREE.Vector3().addVectors(point2, vector23),
        ], config);
    }
    static fromAttributes(attributes) {
        const { points } = attributes;
        return new Polyline(points);
    }
}
/**
 * A part of a circle's circumference.
 *
 * @example arc.ts
 */
class Arc extends Shape {
    constructor(radius = 1, angle = Math.PI / 2, config = {}) {
        config = Object.assign(Object.assign({}, Arc.defaultConfig()), config);
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
        this.radius = radius;
        this.angle = angle;
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
        return Object.assign(Object.assign({}, super.defaultConfig()), { closed: false, fill: false });
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
    // TODO: Handle reflex angles.
    static asAngle(point1, point2, point3, config = {}) {
        config = Object.assign({ radius: 0.4, reflex: false }, config);
        const vector21 = new THREE.Vector3().subVectors(point1, point2);
        const vector23 = new THREE.Vector3().subVectors(point3, point2);
        const arcAngle = vector21.angleTo(vector23);
        const arcRotation = Math.min(Utils.RIGHT.signedAngleTo(vector21), Utils.RIGHT.signedAngleTo(vector23));
        const arc = new Arc(config.radius, arcAngle, config);
        arc.position.copy(point2);
        arc.rotateZ(arcRotation);
        return arc;
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
        super(radius, 2 * Math.PI, Object.assign(Object.assign({}, Circle.defaultConfig()), config));
    }
    reshape(radius, config = {}) {
        this.radius = radius;
        this.copyStrokeFill(new Circle(radius, config));
    }
    static defaultConfig() {
        return Object.assign(Object.assign({}, super.defaultConfig()), { fill: true });
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
        config = Object.assign(Object.assign({ fillColor: new THREE.Color("black"), fillOpacity: 1 }, Point.defaultConfig()), config);
        super(config.radius, config);
        this.position.set(position.x, position.y, 0);
    }
    static defaultConfig() {
        return Object.assign(Object.assign({}, super.defaultConfig()), { radius: 0.08 });
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
 * A shape made up of line segments connected
 * to form a (usually) closed shape.
 *
 * @example polygon.ts
 */
class Polygon extends Shape {
    constructor(points, config = {}) {
        super(points, Object.assign(Object.assign({}, Polygon.defaultConfig()), config));
        this.curveEndIndices = [];
        for (let i = 0; i < points.length - 1; i++) {
            this.curveEndIndices.push([i, i + 1]);
        }
    }
    getClassConfig() {
        return {};
    }
    getAttributes() {
        return { points: this.points };
    }
    static fromAttributes(attributes) {
        const { points } = attributes;
        return new Polygon(points);
    }
    get attributeData() {
        return [];
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
        ], Object.assign(Object.assign({}, Rectangle.defaultConfig()), config));
        this.width = width;
        this.height = height;
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
        super(sideLength, sideLength, Object.assign(Object.assign({}, Square.defaultConfig()), config));
        this.sideLength = sideLength;
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
export { Shape, Line, Arrow, Point, Circle, Arc, Polygon, Polyline, Rectangle, Square, };
//# sourceMappingURL=geometry.js.map