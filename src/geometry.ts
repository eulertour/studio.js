import * as THREE from "three";
import { ERROR_THRESHOLD, PIXELS_TO_COORDS } from "./constants";
import {
  MeshLineGeometry,
  MeshLineMaterial,
  MeshLineRaycast,
} from "./THREE.MeshLine.dev.js";
import { MeshLineGeometry as G, MeshLineMaterial as M } from "./MeshLine/Line";
import type {
  Transform,
  Style,
  StyleJson,
  Representation,
  LineAttributes,
  PolygonAttributes,
  ArcAttributes,
  RectangleAttributes,
} from "./geometry.types.js";

class MeshLine extends THREE.Mesh {
  constructor() {
    const geometry = new G([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(2, 2, 0),
      new THREE.Vector3(0, 3, 0),
    ]);
    const material = new M();
    super(geometry, material);
  }
}

const GeometryResolution = new THREE.Vector2();

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
type Stroke = THREE.Mesh<MeshLine, MeshLineMaterial>;

abstract class Shape extends THREE.Group {
  fill: Fill;
  fillVisible: boolean;
  stroke: Stroke;
  strokeVisible: boolean;
  curveEndIndices: Array<Array<number>>;

  constructor(
    points: Array<THREE.Vector3>,
    {
      strokeColor = new THREE.Color(0x000000),
      strokeOpacity = 1.0,
      strokeWidth = 4 * PIXELS_TO_COORDS,
      stroke = true,
      fillColor = new THREE.Color(0xfffaf0),
      fillOpacity = 1.0,
      fill = false,
    }: Style = {}
  ) {
    super();

    const fillGeometry = getFillGeometry(points);
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: fillColor,
      opacity: fillOpacity,
      transparent: true,
      polygonOffset: true,
    });
    this.fill = new THREE.Mesh(fillGeometry, fillMaterial);

    this.fillVisible = fill;
    if (this.fillVisible) {
      this.add(this.fill);
    }

    const strokeGeometry = new MeshLine();
    strokeGeometry.setPoints(points);
    const strokeMaterial = new MeshLineMaterial({
      color: strokeColor,
      opacity: strokeOpacity,
      lineWidth: strokeWidth,
      transparent: true,
      polygonOffset: true,
    });
    // Set the uniform to a reference to GeometryResolution so that
    // strokes automatically update when the canvas resolution changes.
    strokeMaterial.uniforms.resolution.value = GeometryResolution;
    this.stroke = new THREE.Mesh(strokeGeometry, strokeMaterial);
    this.stroke.raycast = MeshLineRaycast;

    this.strokeVisible = stroke;
    if (this.strokeVisible) {
      this.add(this.stroke);
    }

    this.curveEndIndices = this.getCurveEndIndices();
  }

  get points(): Array<THREE.Vector3> {
    return this.stroke.geometry._points;
  }

  curve(curveIndex: number, worldTransform = true) {
    const curveEndIndices = this.curveEndIndices[curveIndex];
    const curvePoints = this.points.slice(
      curveEndIndices[0],
      curveEndIndices[1] + 1
    );
    if (worldTransform) {
      return curvePoints.map((p) => p.clone().applyMatrix4(this.matrixWorld));
    } else {
      return curvePoints;
    }
  }

  get numCurves() {
    return this.curveEndIndices.length;
  }

  getCurveEndIndices() {
    const points = this.stroke.geometry._points;
    const indices = [];
    for (let i = 0; i < points.length - 1; i++) {
      indices.push([i, i + 1]);
    }
    return indices;
  }

  clear() {
    this.removeStroke();
    this.removeFill();
    return this;
  }

  clone(recursive: boolean) {
    if (recursive === false) {
      throw Error("Shape.clone() is always recursive");
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const clone = new this.constructor(...this.getCloneAttributes(), {
      ...this.getStyle(),
      ...this.getClassConfig(),
    });
    THREE.Object3D.prototype.copy.call(clone, this, false);
    return clone;
  }

  getClassConfig() {
    return {};
  }

  copy(source: this, recursive: boolean) {
    if (recursive === false) {
      throw Error("Shape.clone() is always recursive");
    }

    const originalFillVisible = source.fillVisible;
    const originalStrokeVisible = source.strokeVisible;

    this.clear();
    source.clear();
    source.addFill();
    source.addStroke();

    super.copy(source, true);
    this.fill = this.children[0] as Fill;
    this.stroke = this.children[1] as Stroke;
    this.stroke.raycast = source.stroke.raycast;

    source.clear();
    this.clear();

    if (originalFillVisible) {
      source.addFill();
      this.addFill();
    }

    if (originalStrokeVisible) {
      source.addStroke();
      this.addStroke();
    }

    for (const { attribute } of source.attributeData) {
      this[attribute] = source[attribute];
    }
    this.curveEndIndices = source.curveEndIndices;

    return this;
  }

  abstract getAttributes(): object;

  static styleToJson = (style: Style): StyleJson => {
    const {
      strokeColor,
      strokeOpacity,
      strokeWidth,
      stroke,
      fillColor,
      fillOpacity,
      fill,
    } = style;
    return {
      strokeColor: strokeColor ? strokeColor.toArray() : undefined,
      strokeOpacity,
      strokeWidth,
      stroke,
      fillColor: fillColor ? fillColor.toArray() : undefined,
      fillOpacity,
      fill,
    };
  };

  static jsonToStyle = (styleJson: StyleJson): Style => {
    const {
      strokeColor,
      strokeOpacity,
      strokeWidth,
      stroke,
      fillColor,
      fillOpacity,
      fill,
    } = styleJson;
    return {
      strokeColor: strokeColor
        ? new THREE.Color().fromArray(strokeColor)
        : undefined,
      strokeOpacity,
      strokeWidth,
      stroke,
      fillColor: fillColor ? new THREE.Color().fromArray(fillColor) : undefined,
      fillOpacity,
      fill,
    };
  };

  toJson() {
    return {
      className: this.constructor.name,
      attributes: this.getAttributes(),
      transform: this.getTransform(),
      style: Shape.styleToJson(this.getStyle()),
    };
  }

  static fromJson(json: Representation) {
    const shape = this.fromAttributes(json.attributes);

    if (json.transform !== undefined) {
      shape.setTransform(json.transform);
    }

    if (json.style !== undefined) {
      shape.setStyle(Shape.jsonToStyle(json.style));
    }

    return shape;
  }

  getCloneAttributes(): Array<unknown> {
    return [this.points];
  }

  getStyle(): Style {
    return {
      fill: this.fillVisible,
      fillColor: this.fill.material.color,
      fillOpacity: this.fill.material.opacity,
      stroke: this.strokeVisible,
      strokeColor: this.stroke.material.uniforms.color.value,
      strokeOpacity: this.stroke.material.opacity,
      strokeWidth: this.stroke.material.lineWidth,
    };
  }

  setStyle(style: Style): void {
    const { fillColor, fillOpacity, fill } = style;
    if (fillColor !== undefined) {
      this.fill.material.color = fillColor;
    }
    if (fillOpacity !== undefined) {
      this.fill.material.opacity = fillOpacity;
    }
    if (fill !== undefined) {
      fill ? this.addFill() : this.removeFill();
    }

    const { strokeColor, strokeOpacity, strokeWidth, stroke } = style;
    if (strokeColor !== undefined) {
      this.stroke.material.color = strokeColor;
    }
    if (strokeOpacity !== undefined) {
      this.stroke.material.opacity = strokeOpacity;
    }
    if (strokeWidth !== undefined) {
      this.stroke.material.lineWidth = strokeWidth;
    }
    if (stroke !== undefined) {
      stroke ? this.addStroke() : this.removeStroke();
    }
  }

  getTransform(): Transform {
    return {
      position: this.position.toArray(),
      rotation: [this.rotation.x, this.rotation.y, this.rotation.z],
      scale: this.scale.x,
    };
  }

  setTransform(transform: Transform): void {
    const { position, rotation, scale } = transform;
    this.position.set(...position);
    this.setRotationFromEuler(new THREE.Euler(...rotation));
    this.scale.set(scale, scale, scale);
  }

  addStroke() {
    this.add(this.stroke);
    this.strokeVisible = true;
  }

  removeStroke() {
    this.remove(this.stroke);
    this.strokeVisible = false;
  }

  addFill() {
    this.add(this.fill);
    this.fillVisible = true;
  }

  removeFill() {
    this.remove(this.fill);
    this.fillVisible = false;
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
}

class Line extends Shape {
  transformCenter: boolean;

  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: Style & { transformCenter?: boolean } = { transformCenter: true }
  ) {
    let lineStart, lineEnd;
    const strokeCenter = new THREE.Vector3()
      .addVectors(start, end)
      .divideScalar(2);
    if (config.transformCenter) {
      lineStart = new THREE.Vector3().subVectors(start, strokeCenter);
      lineEnd = new THREE.Vector3().subVectors(end, strokeCenter);
    } else {
      lineStart = start;
      lineEnd = end;
    }
    super([lineStart, lineEnd], { ...config, fill: false });
    this.start = lineStart;
    this.end = lineEnd;
    this.transformCenter = config.transformCenter;
    if (config.transformCenter) {
      this.position.copy(strokeCenter);
    }

    this.curveEndIndices = [[0, 1]];
  }

  getClassConfig() {
    return { transformCenter: this.transformCenter };
  }

  get getAttributes(): LineAttributes {
    return {
      start: this.start,
      end: this.end,
    };
  }

  static fromAttributes(attributes: LineAttributes): Line {
    const { start, end } = attributes;
    return new Line(start, end);
  }
}

class Arc extends Shape {
  constructor(
    public radius = 1,
    public angle: number = Math.PI / 2,
    public closed = false,
    config: Style = {}
  ) {
    let points = [];
    for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
      points.push(
        new THREE.Vector3(radius * Math.cos(i), radius * Math.sin(i), 0)
      );
    }
    if (closed) {
      points = [
        new THREE.Vector3(0, 0, 0),
        ...points,
        new THREE.Vector3(0, 0, 0),
      ];
    }
    super(points, config);
    this.radius = radius;
    this.angle = angle;
    this.closed = closed;
    if (closed) {
      this.curveEndIndices = [
        [0, 1],
        [1, points.length - 2],
        [points.length - 2, points.length - 1],
      ];
    } else {
      this.curveEndIndices = [[0, points.length - 1]];
    }
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
    return new Arc(radius, angle, closed);
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

class Circle extends Arc {
  constructor(radius = 1, config: Style = {}) {
    super(radius, 2 * Math.PI, false, config);
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

class Point extends Circle {
  // TODO: this.location should return this.position
  constructor(
    public location: THREE.Vector2 | THREE.Vector3,
    config: Style = {}
  ) {
    super(0.08, {
      fillColor: new THREE.Color("black"),
      fill: true,
      ...config,
    });
    this.position.set(location.x, location.y, 0);
  }

  getAttributes(): ArcAttributes {
    return {
      radius: 0.08,
      angle: 2 * Math.PI,
      closed: false,
    };
  }

  static fromAttributes(): Point {
    return new Point(new THREE.Vector3());
  }
}

class Polygon extends Shape {
  transformCenter: boolean;

  constructor(
    points: Array<THREE.Vector3>,
    config: Style & { transformCenter?: boolean } = { transformCenter: true }
  ) {
    if (config.transformCenter) {
      const min = new THREE.Vector3(Infinity, Infinity, Infinity);
      const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
      for (const point of points.slice(0, points.length - 1)) {
        min.min(point);
        max.max(point);
      }
      const center = new THREE.Vector3().addVectors(min, max).divideScalar(2);
      const newPoints = points.map((p) =>
        new THREE.Vector3().subVectors(p, center)
      );
      super(newPoints, config);
      this.position.copy(center);
    } else {
      super(points, config);
    }
    this.transformCenter = config.transformCenter;

    this.curveEndIndices = [];
    for (let i = 0; i < points.length - 1; i++) {
      this.curveEndIndices.push([i, i + 1]);
    }
  }

  getClassConfig() {
    return { transformCenter: this.transformCenter };
  }

  getAttributes(): PolygonAttributes {
    return {
      points: this.points,
    };
  }

  static fromAttributes(attributes: PolygonAttributes): Polygon {
    const { points } = attributes;
    return new Polygon(points);
  }

  get attributeData() {
    return [];
  }
}

class Rectangle extends Shape {
  constructor(public width = 4, public height = 2, config: Style = {}) {
    super(
      [
        new THREE.Vector3(-width / 2, height / 2, 0),
        new THREE.Vector3(width / 2, height / 2, 0),
        new THREE.Vector3(width / 2, -height / 2, 0),
        new THREE.Vector3(-width / 2, -height / 2, 0),
        new THREE.Vector3(-width / 2, height / 2, 0),
      ],
      config
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

class Square extends Rectangle {
  constructor(public sideLength = 2, config = {}) {
    super(sideLength, sideLength, config);
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
    return new Square(width, width);
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

const shapeFromJson = (json: object): Shape => {
  switch (json.className) {
    case "Line":
      return Line.fromJson(json);
    case "Arc":
      return Arc.fromJson(json);
    case "Circle":
      return Circle.fromJson(json);
    case "Point":
      return Point.fromJson(json);
    case "Polygon":
      return Polygon.fromJson(json);
    case "Rectangle":
      return Rectangle.fromJson(json);
    case "Square":
      return Square.fromJson(json);
    default:
      throw Error(`Invalid JSON ${json}`);
  }
};

export {
  GeometryResolution,
  shapeFromJson,
  Shape,
  Line,
  Point,
  Circle,
  Arc,
  Polygon,
  Rectangle,
  Square,
  MeshLine,
};
