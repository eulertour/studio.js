import { Style } from "./geometry.js";
import Rectangle from "./rectangle.js";
import RectangleAttributes from "./rectangle.js";


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