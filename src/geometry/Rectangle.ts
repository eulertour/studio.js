import * as THREE from "three";
import Shape, { Style } from "./Shape.js";

export type RectangleAttributes = {
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

  area() {
    return this.width * this.height
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
}
