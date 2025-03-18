import { ERROR_THRESHOLD } from "../constants.js";
import Shape, { Style } from "./Shape.js";
import * as THREE from "three/webgpu";

export type CircleAttributes = {
  radius: number;
};

/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
export default class Circle extends Shape {
  constructor(
    public radius = 1,
    config: Style = {},
  ) {
    const angle = 2 * Math.PI;
    let points = [];
    for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
      points.push(
        new THREE.Vector3(radius * Math.cos(i), radius * Math.sin(i), 0),
      );
    }

    super(points, {
      ...Circle.defaultConfig(),
      ...config,
    });
  }

  reshape(radius: number, config = {}) {
    this.radius = radius;
    this.copyStrokeAndFill(new Circle(radius, config));
  }

  getCloneAttributes() {
    return [this.radius];
  }

  getAttributes(): CircleAttributes {
    return {
      radius: this.radius,
    };
  }

  static fromAttributes(attributes: CircleAttributes): Circle {
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
