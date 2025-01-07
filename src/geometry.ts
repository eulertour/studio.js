import { MeshLine } from "./MeshLine/index.js";
import Shape, { type Style, type Transform } from "./shape.js";
import Line, { LineAttributes } from "./line.js";
import Arrow from "./arrow.js";
import Polygon, { PolygonAttributes } from "./polygon.js";
import Polyline from "./polyline.js";
import Arc, { ArcAttributes } from "./arc.js";
import Circle from "./circle.js";
import Point from "./point.js";
import Rectangle, { RectangleAttributes } from "./rectangle.js";

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
