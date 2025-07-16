import Shape from "./Shape.js";
import { type Style } from "./utils.js";
import { THREE } from "../index.js";
import { ERROR_THRESHOLD } from "../constants.js";

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
  constructor(inputPoints: Array<THREE.Vector3>, config: Style = {}) {
    let points = [...inputPoints];

    if (points.length < 3) {
      throw new Error("Polygon must be called with at least three points");
    }

    // Ensure the polygon is closed by adding the first point to
    // the end if necessary.
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (firstPoint === undefined || lastPoint === undefined) {
      throw new Error("firstPoint or lastPoint is undefined");
    }
    const firstToLastDistance = firstPoint.distanceTo(lastPoint);
    if (firstToLastDistance > ERROR_THRESHOLD) {
      points.push(firstPoint.clone());
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
