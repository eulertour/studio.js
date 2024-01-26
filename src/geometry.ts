import * as THREE from "three";
import { ERROR_THRESHOLD } from "./constants";
import { MeshLineGeometry, MeshLineMaterial } from "./MeshLine";
import type {
  Transform,
  Style,
  LineAttributes,
  PolygonAttributes,
  ArcAttributes,
  RectangleAttributes,
} from "./geometry.types.js";
import { ORIGIN } from "./utils";
import MeshLineRaycast from "./MeshLine/MeshLineRaycast";

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
type Stroke = THREE.Mesh<MeshLineGeometry, MeshLineMaterial>;

abstract class Shape extends THREE.Group {
  fill: Fill;
  stroke: Stroke;
  curveEndIndices: Array<Array<number>>;

  constructor(points: Array<THREE.Vector3>, config: Style & ArrowConfig = {}) {
    super();
    config = Object.assign(
      {
        strokeColor: new THREE.Color(0x000000),
        strokeOpacity: 1.0,
        strokeWidth: 8,
        fillColor: new THREE.Color(0xfffaf0),
        fillOpacity: 0.0,
      },
      config
    );

    const fillGeometry = getFillGeometry(points);
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: config.fillColor,
      opacity: config.fillOpacity,
      transparent: true,
    });
    this.fill = new THREE.Mesh(fillGeometry, fillMaterial);
    this.add(this.fill);

    const strokeGeometry = new MeshLineGeometry(config.arrow);
    strokeGeometry.setPoints(points);
    const strokeMaterial = new MeshLineMaterial({
      color: config.strokeColor,
      opacity: config.strokeOpacity,
      width: config.strokeWidth,
      transparent: true,
    });
    this.stroke = new THREE.Mesh(strokeGeometry, strokeMaterial);
    this.stroke.raycast = MeshLineRaycast;
    this.add(this.stroke);

    this.curveEndIndices = this.getCurveEndIndices();
  }

  get points(): Array<THREE.Vector3> {
    return this.stroke.geometry.points;
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

    const cloneFunc = (this.constructor as new (...args: any[]) => this)
    const clone = new cloneFunc(
      ...this.getCloneAttributes(), {
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
}

interface ArrowConfig {
  arrow?: boolean;
}

interface ArcConfig {
  closed?: boolean;
}

class Line extends Shape {
  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: Style & ArrowConfig = {}
  ) {
    super([start, end], { ...config, fillOpacity: 0 });
    this.curveEndIndices = [[0, 1]];
  }

  static centeredLine(start: THREE.Vector3, end: THREE.Vector3, config: Style = {}) {
    const center = new THREE.Vector3()
      .addVectors(start, end)
      .divideScalar(2);
    const line = new Line(
      new THREE.Vector3().subVectors(start, center),
      new THREE.Vector3().subVectors(end, center),
      config,
    );
    line.position.copy(center);
    return line;
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

  toVector(global: boolean) {
    this.updateWorldMatrix(true, false);
    return global
      ? new THREE.Vector3().subVectors(
          new THREE.Vector3().copy(this.end).applyMatrix4(this.matrixWorld),
          new THREE.Vector3().copy(this.start).applyMatrix4(this.matrixWorld)
        )
      : new THREE.Vector3().subVectors(this.end, this.start);
  }

  static fromAttributes(attributes: LineAttributes): Line {
    const { start, end } = attributes;
    return new Line(start, end);
  }
}

class Arrow extends Line {
  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: Style & ArrowConfig = {}
  ) {
    super(start, end, { ...config, arrow: true });
  }
}

class Polyline extends Shape {
  constructor(points: Array<THREE.Vector3>, config: Style = {}) {
    super(points, { ...config, fillOpacity: 0 });

    this.curveEndIndices = [[0, 1]];
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

class Arc extends Shape {
  public closed: boolean;

  constructor(
    public radius = 1,
    public angle: number = Math.PI / 2,
    config: Style & ArcConfig = {}
  ) {
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
          )
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
    this.radius = radius;
    this.angle = angle;
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

class Circle extends Arc {
  constructor(radius = 1, config: Style = {}) {
    super(radius, 2 * Math.PI, config);
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
  constructor(
    position: THREE.Vector2 | THREE.Vector3 = ORIGIN,
    config: Style & { radius?: number } = {}
  ) {
    config = {
      radius: 0.08,
      fillColor: new THREE.Color("black"),
      fillOpacity: 1,
      ...config,
    };
    super(config.radius, config);
    this.position.set(position.x, position.y, 0);
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

class Polygon extends Shape {
  constructor(
    points: Array<THREE.Vector3>,
    config: Style = {}
  ) {
    super(points, config);
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

/** This is a square. */
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
};