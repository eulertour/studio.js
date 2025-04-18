import { ERROR_THRESHOLD } from "../constants.js";
import Shape, { Style } from "./Shape.js";
import * as THREE from "three";

export type EllipseAttributes = {
  radiusA: number;
  radiusB: number;
};

export default class Ellipse extends Shape {
  constructor(
    public radiusA = 2,
    public radiusB = 1,
    config: Style = {},
  ) {
    const angle = 2 * Math.PI;
    let points = [];

    for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
      const angle = i;
      const x = radiusA * Math.cos(angle);
      const y = radiusB * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    super(points, {
      ...Ellipse.defaultConfig(),
      ...config,
    });
  }

  reshape(radiusA: number, radiusB: number, config = {}) {
    this.radiusA = radiusA;
    this.radiusB = radiusB;
    this.copyStrokeAndFill(new Ellipse(radiusA, radiusB, config));
  }

  getCloneAttributes() {
    return [this.radiusA, this.radiusB];
  }

  getAttributes(): EllipseAttributes {
    return {
      radiusA: this.radiusA,
      radiusB: this.radiusB,
    };
  }

  static fromAttributes(attributes: EllipseAttributes): Ellipse {
    const { radiusA, radiusB } = attributes;
    return new Ellipse(radiusA, radiusB);
  }

  get attributeData() {
    return [
      {
        attribute: "radiusA",
        type: "number",
        default: 1,
      },
      {
        attribute: "radiusB",
        type: "number",
        default: 2,
      },
    ];
  }
}
