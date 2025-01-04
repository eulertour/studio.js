import { Style } from "./geometry.js";
import * as THREE from "three";
import Shape from "./shape.js";

type RectangleAttributes = {
    width: number;
    height: number;
  };
  
  /**
   * A shape with four sides and four right angles.
   *
   * @example rectangle.ts
   */
  export default class Rectangle extends Shape {
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