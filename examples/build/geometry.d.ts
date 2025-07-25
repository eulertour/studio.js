import * as THREE from "three/webgpu";
import { MeshLine } from "./MeshLine";
import type {
  ArcAttributes,
  LineAttributes,
  PolygonAttributes,
  RectangleAttributes,
  Style,
  Transform,
} from "./geometry.types.js";
type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
type Stroke = MeshLine;
/**
 * An abstract class representing a generalized shape.
 */
declare abstract class Shape extends THREE.Group {
  fill?: Fill;
  stroke?: Stroke;
  curveEndIndices: Array<Array<number>>;
  arrow: boolean;
  constructor(
    points: Array<THREE.Vector3>,
    config?: Style & {
      arrow?: boolean;
      stroke?: boolean;
      fill?: boolean;
    },
  );
  static defaultStyle(): {
    fillColor: THREE.Color;
    fillOpacity: number;
    strokeColor: THREE.Color;
    strokeOpacity: number;
    strokeWidth: number;
    strokeDashLength: number;
    strokeDashOffset: number;
    dashed: boolean;
  };
  static defaultConfig(): {};
  reshape(...args: any[]): void;
  copyStroke(shape: Shape): void;
  copyFill(shape: Shape): void;
  copyStrokeFill(shape: Shape): void;
  get points(): Array<THREE.Vector3>;
  worldPoint(index: number): THREE.Vector3;
  transformedPoint(index: number, targetSpace: THREE.Object3D): THREE.Vector3;
  segment(index: number): THREE.Line3;
  curve(curveIndex: number, worldTransform?: boolean): THREE.Vector3[];
  get numCurves(): number;
  getCurveEndIndices(): any[];
  clear(): this;
  clone(recursive?: boolean): this;
  getClassConfig(): {};
  abstract getAttributes(): object;
  getCloneAttributes(): Array<unknown>;
  getStyle(): Style;
  setStyle(style: Style): void;
  getTransform(): Transform;
  setTransform(transform: Transform): void;
  dispose(): this;
  getDimensions(): THREE.Vector2;
  closestPointToPoint(
    point: THREE.Vector3,
    target?: THREE.Vector3,
  ): THREE.Vector3;
}
/**
 * A segment between two points.
 *
 * @example line.ts
 */
declare class Line extends Shape {
  start: THREE.Vector3;
  end: THREE.Vector3;
  constructor(
    start: THREE.Vector3,
    end: THREE.Vector3,
    config?: Style & {
      arrow?: boolean;
    },
  );
  static defaultConfig(): {
    arrow: boolean;
  };
  static centeredLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    config?: Style,
  ): Line;
  reshape(
    start: THREE.Vector3,
    end: THREE.Vector3,
    config?: Style & {
      arrow?: boolean;
    },
  ): void;
  getClassConfig(): {};
  getAttributes(): LineAttributes;
  getVector(global?: boolean): THREE.Vector3;
  static fromAttributes(attributes: LineAttributes): Line;
}
/**
 * An arrow derived from a line.
 *
 * @example arrow.ts
 */
declare class Arrow extends Line {
  start: THREE.Vector3;
  end: THREE.Vector3;
  constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
  reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
}
/**
 * A series of connected line segments.
 *
 * @example polyline.ts
 */
declare class Polyline extends Shape {
  constructor(points: Array<THREE.Vector3>, config?: Style);
  reshape(points: Array<THREE.Vector3>, config?: Style): void;
  static defaultConfig(): {
    fill: boolean;
  };
  getClassConfig(): {};
  getAttributes(): PolygonAttributes;
  static fromAttributes(attributes: PolygonAttributes): Polyline;
}
/**
 * A part of a circle's circumference.
 *
 * @example arc.ts
 */
declare class Arc extends Shape {
  radius: number;
  angle: number;
  closed: boolean;
  constructor(
    radius?: number,
    angle?: number,
    config?: Style & {
      closed?: boolean;
    },
  );
  static defaultConfig(): {
    closed: boolean;
    fill: boolean;
  };
  reshape(
    radius?: number,
    angle?: number,
    config?: Style & {
      closed?: boolean;
    },
  ): void;
  getCloneAttributes(): (number | boolean)[];
  getAttributes(): ArcAttributes;
  static fromAttributes(attributes: ArcAttributes): Arc;
  get attributeData(): (
    | {
        attribute: string;
        type: string;
        default: number;
      }
    | {
        attribute: string;
        type: string;
        default: boolean;
      }
  )[];
  getDimensions(): THREE.Vector2;
}
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
declare class Circle extends Arc {
  constructor(
    radius?: number,
    config?: Style & {
      fill?: boolean;
    },
  );
  reshape(radius: number, config?: {}): void;
  static defaultConfig(): {
    fill: boolean;
    closed: boolean;
  };
  getCloneAttributes(): number[];
  getAttributes(): ArcAttributes;
  static fromAttributes(attributes: ArcAttributes): Circle;
  get attributeData(): {
    attribute: string;
    type: string;
    default: number;
  }[];
}
/**
 * A small circle representing a precise location in space.
 *
 * @example point.ts
 */
declare class Point extends Circle {
  constructor(
    position?: THREE.Vector2 | THREE.Vector3,
    config?: Style & {
      radius?: number;
    },
  );
  static defaultConfig(): {
    radius: number;
    fill: boolean;
    closed: boolean;
  };
  getAttributes(): ArcAttributes;
  static fromAttributes(): Point;
}
/**
 * A shape made up of line segments connected
 * to form a (usually) closed shape.
 *
 * @example polygon.ts
 */
declare class Polygon extends Shape {
  constructor(points: Array<THREE.Vector3>, config?: Style);
  getClassConfig(): {};
  getAttributes(): PolygonAttributes;
  static fromAttributes(attributes: PolygonAttributes): Polygon;
  get attributeData(): any[];
}
/**
 * A shape with four sides and four right angles.
 *
 * @example rectangle.ts
 */
declare class Rectangle extends Shape {
  width: number;
  height: number;
  constructor(width?: number, height?: number, config?: Style);
  getCloneAttributes(): number[];
  getAttributes(): RectangleAttributes;
  static fromAttributes(attributes: RectangleAttributes): Rectangle;
  get attributeData(): {
    attribute: string;
    type: string;
    default: number;
  }[];
  getCurveEndIndices(): Array<Array<number>>;
}
/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
declare class Square extends Rectangle {
  sideLength: number;
  constructor(sideLength?: number, config?: Style);
  reshape(sideLength: number, config?: {}): void;
  getCloneAttributes(): number[];
  getAttributes(): RectangleAttributes;
  static fromAttributes(attributes: RectangleAttributes): Square;
  get attributeData(): {
    attribute: string;
    type: string;
    default: number;
  }[];
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
