import Shape, { Style } from "./Shape.js";
import { THREE } from "../index.js";

export type PolygonAttributes = {
  points: Array<THREE.Vector3>;
};

/**
 * A shape made up of line segments connected
 * to form a (usually) closed shape.
 *
 * @example polygon.ts
 */

export default class Polygon extends Shape {
  constructor(points: Array<THREE.Vector3>, config: Style = {}) {
    // Ensure the polygon is closed by adding the first point to the end
    if (points.length > 0 && !points[0].equals(points[points.length - 1])) {
      points.push(points[0]);
    }

    super(points, { ...Polygon.defaultConfig(), ...config });
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
