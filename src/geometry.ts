import THREE from "./three.js";
import { MeshLine } from "./MeshLine/index.js";
import { ERROR_THRESHOLD } from "./constants.js";
import { ORIGIN } from "./utils.js";
import Shape from "./shape.js";
import Arrow from "./arrow.js";
import Line from "./line.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";

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

type ArcAttributes = {
  radius: number;
  angle: number;
  closed: boolean;
};

type RectangleAttributes = {
  width: number;
  height: number;
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
  ArcAttributes,
  RectangleAttributes,
};
