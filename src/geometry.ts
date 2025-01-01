import { Utils } from "./index.js";
import THREE from "./three.js";
import {
  MeshLine,
  MeshLineGeometry,
  MeshLineMaterial,
} from "./MeshLine/index.js";
import { ERROR_THRESHOLD } from "./constants.js";
import { ORIGIN } from "./utils.js";

type Transform = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

type Style = {
  fillColor?: THREE.Color;
  fillOpacity?: number;
  strokeColor?: THREE.Color;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDashLength?: number;
  strokeDashOffset?: number;
  dashed?: boolean;
};

type LineAttributes = {
  start: THREE.Vector3;
  end: THREE.Vector3;
};

type ArcAttributes = {
  radius: number;
  angle: number;
  closed: boolean;
};

type RectangleAttributes = {
  width: number;
  height: number;
};

type PolygonAttributes = {
  points: Array<THREE.Vector3>;
};

const getFillGeometry = (points: Array<THREE.Vector3>) => {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) {
    shape.lineTo(point.x, point.y);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
};

type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
type Stroke = MeshLine;

/**
 * An abstract class representing a generalized shape.
 */
abstract class Shape extends THREE.Group {
  fill?: Fill;
  stroke?: Stroke;
  curveEndIndices: Array<Array<number>>;
  arrow: boolean;

  constructor(
    points: Array<THREE.Vector3>,
    config: Style & { arrow?: boolean; stroke?: boolean; fill?: boolean } = {},
  ) {
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

      if (config.dashed && config.strokeDashLength === 0) {
        config.strokeDashLength = 0.4;
      }

      const strokeMaterial = new MeshLineMaterial({
        color: config.strokeColor,
        opacity: config.strokeOpacity,
        transparent: true,
        side: THREE.DoubleSide,
        width: config.strokeWidth,
        dashLength: config.strokeDashLength,
        dashOffset: config.strokeDashOffset,
      });
      this.stroke = new MeshLine(strokeGeometry, strokeMaterial);
      this.add(this.stroke);
    }

    this.curveEndIndices = this.getCurveEndIndices();
  }

  static defaultStyle() {
    return {
      fillColor: new THREE.Color(0xfffaf0),
      fillOpacity: 0.0,
      strokeColor: new THREE.Color(0x000000),
      strokeOpacity: 1.0,
      strokeWidth: 4,
      strokeDashLength: 0,
      strokeDashOffset: 0,
      dashed: false,
    };
  }

  static defaultConfig() {
    return {};
  }

  reshape(...args: any[]) {
    throw new Error("Reshape not implemented.");
  }

  copyStroke(shape: Shape) {
    this.stroke.geometry.dispose();
    this.stroke.geometry = shape.stroke.geometry;
  }

  copyFill(shape: Shape) {
    this.fill.geometry.dispose();
    this.fill.geometry = shape.fill.geometry;
  }

  copyStrokeFill(shape: Shape) {
    this.copyStroke(shape);
    this.copyFill(shape);
  }

  get points(): Array<THREE.Vector3> {
    return this.stroke.geometry.points;
  }

  worldPoint(index: number) {
    return this.localToWorld(this.points[index].clone());
  }

  transformedPoint(index: number, targetSpace: THREE.Object3D) {
    const startingPoint = this.points[index].clone();
    return Utils.transformBetweenSpaces(this, targetSpace, startingPoint);
  }

  segment(index: number) {
    return new THREE.Line3(
      this.points[index].clone(),
      this.points[index + 1].clone(),
    );
  }

  curve(curveIndex: number, worldTransform = true) {
    const curveEndIndices = this.curveEndIndices[curveIndex];
    const curvePoints = this.points.slice(
      curveEndIndices[0],
      curveEndIndices[1] + 1,
    );
    if (worldTransform) {
      return curvePoints.map((p) => p.clone().applyMatrix4(this.matrixWorld));
    }
    return curvePoints;
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

  clone(recursive?: boolean): this {
    if (recursive === true) {
      throw Error("Recursive Shape.clone() isn't implemented.");
    }

    const cloneFunc = this.constructor as new (...args: any[]) => this;
    const clone = new cloneFunc(...this.getCloneAttributes(), {
      ...this.getStyle(),
      ...this.getClassConfig(),
    });
    THREE.Object3D.prototype.copy.call(clone, this, false);
    return clone;
  }

  getClassConfig() {
    return {};
  }

  abstract getAttributes(): object;

  getCloneAttributes(): Array<unknown> {
    return [this.points];
  }

  getStyle(): Style {
    return {
      fillColor: this.fill.material.color,
      fillOpacity: this.fill.material.opacity,
      strokeColor: this.stroke.material.color,
      strokeOpacity: this.stroke.material.opacity,
      strokeWidth: this.stroke.material.width,
    };
  }

  setStyle(style: Style): void {
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

    if (style.dashed === true) {
      this.stroke.material.dashLength = 0.4;
    }
    const { strokeDashLength, strokeDashOffset } = style;
    if (strokeDashLength !== undefined) {
      this.stroke.material.dashLength = strokeDashLength;
    }
    if (strokeDashOffset !== undefined) {
      this.stroke.material.dashOffset = strokeDashOffset;
    }
  }

  getTransform(): Transform {
    return {
      position: this.position.clone(),
      rotation: this.rotation.clone(),
      scale: this.scale.clone(),
    };
  }

  setTransform(transform: Transform): void {
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

  closestPointToPoint(point: THREE.Vector3, target?: THREE.Vector3) {
    if (target === undefined) {
      target = new THREE.Vector3();
    }
    const segment = new THREE.Line3();
    const closestPointOnSegment = new THREE.Vector3();
    let minDistance = Number.POSITIVE_INFINITY;
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
  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: Style & { arrow?: boolean } = {},
  ) {
    config = { ...Line.defaultConfig(), ...config };
    super([start, end], config);
    this.arrow = config.arrow;
    this.curveEndIndices = [[0, 1]];
  }

  static defaultConfig() {
    return { ...Shape.defaultConfig(), arrow: false };
  }

  static centeredLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    config: Style = {},
  ) {
    const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
    const line = new Line(
      new THREE.Vector3().subVectors(start, center),
      new THREE.Vector3().subVectors(end, center),
      config,
    );
    line.position.copy(center);
    return line;
  }

  reshape(
    start: THREE.Vector3,
    end: THREE.Vector3,
    config: Style & { arrow?: boolean } = {},
  ) {
    this.start.copy(start);
    this.end.copy(end);
    this.copyStrokeFill(new Line(start, end, config));
  }

  getClassConfig() {
    return {};
  }

  getAttributes(): LineAttributes {
    return {
      start: this.start,
      end: this.end,
    };
  }

  getVector(global = false) {
    this.updateWorldMatrix(true, false);
    return global
      ? new THREE.Vector3().subVectors(
          new THREE.Vector3().copy(this.end).applyMatrix4(this.matrixWorld),
          new THREE.Vector3().copy(this.start).applyMatrix4(this.matrixWorld),
        )
      : new THREE.Vector3().subVectors(this.end, this.start);
  }

  static fromAttributes(attributes: LineAttributes): Line {
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
  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: Style = {},
  ) {
    super(start, end, { ...Arrow.defaultConfig(), ...config, arrow: true });
  }

  reshape(start: THREE.Vector3, end: THREE.Vector3, config: Style = {}) {
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
  constructor(points: Array<THREE.Vector3>, config: Style = {}) {
    super(points, { ...Polyline.defaultConfig(), ...config, fillOpacity: 0 });

    this.curveEndIndices = [[0, 1]];
  }

  reshape(points: Array<THREE.Vector3>, config: Style = {}) {
    this.copyStrokeFill(new Polyline(points, config));
  }

  static defaultConfig() {
    return { ...Shape.defaultConfig(), fill: false };
  }

  getClassConfig() {
    return {};
  }

  getAttributes(): PolygonAttributes {
    return {
      points: this.points,
    };
  }

  static fromAttributes(attributes: PolygonAttributes): Polyline {
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
  public closed: boolean;

  constructor(
    public radius = 1,
    public angle: number = Math.PI / 2,
    config: Style & { closed?: boolean } = {},
  ) {
    config = { ...Arc.defaultConfig(), ...config };
    let points = [];
    let negative = false;
    if (angle < 0) {
      negative = true;
      angle *= -1;
    }
    if (angle > 0) {
      for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
        points.push(
          new THREE.Vector3(
            radius * Math.cos(i),
            radius * Math.sin(i) * (negative ? -1 : 1),
            0,
          ),
        );
      }
    } else {
      points.push(
        new THREE.Vector3(radius, 0, 0),
        new THREE.Vector3(radius, 0, 0),
      );
    }
    if (config.closed) {
      points = [
        new THREE.Vector3(0, 0, 0),
        ...points,
        new THREE.Vector3(0, 0, 0),
      ];
    }
    super(points, config);
    this.closed = config.closed;
    if (this.closed) {
      this.curveEndIndices = [
        [0, 1],
        [1, points.length - 2],
        [points.length - 2, points.length - 1],
      ];
    } else {
      this.curveEndIndices = [[0, points.length - 1]];
    }
  }

  static defaultConfig() {
    return { ...Shape.defaultConfig(), closed: false, fill: false };
  }

  reshape(
    radius = 1,
    angle: number = Math.PI / 2,
    config: Style & { closed?: boolean } = {},
  ) {
    this.radius = radius;
    this.angle = angle;
    this.copyStrokeFill(new Arc(radius, angle, config));
  }

  getCloneAttributes() {
    return [this.radius, this.angle, this.closed];
  }

  getAttributes(): ArcAttributes {
    return {
      radius: this.radius,
      angle: this.angle,
      closed: this.closed,
    };
  }

  static fromAttributes(attributes: ArcAttributes): Arc {
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
  constructor(radius = 1, config: Style & { fill?: boolean } = {}) {
    super(radius, 2 * Math.PI, {
      ...Circle.defaultConfig(),
      ...config,
    });
  }

  reshape(radius: number, config = {}) {
    this.radius = radius;
    this.copyStrokeFill(new Circle(radius, config));
  }

  static defaultConfig() {
    return { ...Arc.defaultConfig(), fill: true };
  }

  getCloneAttributes() {
    return [this.radius];
  }

  getAttributes(): ArcAttributes {
    return {
      radius: this.radius,
      angle: 2 * Math.PI,
      closed: false,
    };
  }

  static fromAttributes(attributes: ArcAttributes): Circle {
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
  constructor(
    position: THREE.Vector2 | THREE.Vector3 = ORIGIN,
    config: Style & { radius?: number } = {},
  ) {
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

  getAttributes(): ArcAttributes {
    return {
      radius: this.radius,
      angle: 2 * Math.PI,
      closed: false,
    };
  }

  static fromAttributes(): Point {
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
  constructor(points: Array<THREE.Vector3>, config: Style = {}) {
    super(points, { ...Polygon.defaultConfig(), ...config });
    this.curveEndIndices = [];
    for (let i = 0; i < points.length - 1; i++) {
      this.curveEndIndices.push([i, i + 1]);
    }
  }

  getClassConfig() {
    return {};
  }

  getAttributes(): PolygonAttributes {
    return { points: this.points };
  }

  static fromAttributes(attributes: PolygonAttributes): Polygon {
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
  constructor(
    public width = 4,
    public height = 2,
    config: Style = {},
  ) {
    super(
      [
        new THREE.Vector3(-width / 2, height / 2, 0),
        new THREE.Vector3(width / 2, height / 2, 0),
        new THREE.Vector3(width / 2, -height / 2, 0),
        new THREE.Vector3(-width / 2, -height / 2, 0),
        new THREE.Vector3(-width / 2, height / 2, 0),
      ],
      { ...Rectangle.defaultConfig(), ...config },
    );
  }

  getCloneAttributes() {
    return [this.width, this.height];
  }

  getAttributes(): RectangleAttributes {
    return {
      width: this.width,
      height: this.height,
    };
  }

  static fromAttributes(attributes: RectangleAttributes): Rectangle {
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

  getCurveEndIndices(): Array<Array<number>> {
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
  constructor(
    public sideLength = 2,
    config: Style = {},
  ) {
    super(sideLength, sideLength, { ...Square.defaultConfig(), ...config });
  }

  reshape(sideLength: number, config = {}) {
    this.sideLength = sideLength;
    this.copyStrokeFill(new Square(sideLength, config));
  }

  getCloneAttributes() {
    return [this.sideLength];
  }

  getAttributes(): RectangleAttributes {
    return {
      width: this.sideLength,
      height: this.sideLength,
    };
  }

  static fromAttributes(attributes: RectangleAttributes): Square {
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

export {
  Shape,
  Line,
  Arrow,
  Point,
  Circle,
  Arc,
  Polygon,
  Polyline,
  Rectangle,
  Square,
  MeshLine,
};

export type {
  Transform,
  Style,
  PolygonAttributes,
  LineAttributes,
  ArcAttributes,
  RectangleAttributes,
};
