import { Style } from "./Shape.js";
import Rectangle, { RectangleAttributes } from "./Rectangle.js";
import { Animation } from "../animation/Animation.js";
import { MathUtils } from "three";

/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
export default class Square extends Rectangle {
  constructor(
    public sideLength = 2,
    config: Style = {},
  ) {
    super(sideLength, sideLength, { ...Square.defaultConfig(), ...config });
  }

  reshape(sideLength: number, config = {}) {
    this.sideLength = sideLength;
    this.copyStrokeAndFill(new Square(sideLength, config));
  }

  Reshape(sideLength: number, config = {}) {
    let startSideLength: number;
    let endSideLength: number;

    return new Animation(
      (t: number, dt: number) => {
        this.reshape(MathUtils.lerp(startSideLength, endSideLength, t));
      },
      {
        before: () => {
          startSideLength = this.sideLength;
          endSideLength = sideLength;
        },
      },
    );
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
