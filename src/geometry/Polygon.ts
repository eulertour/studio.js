import Shape, { Style } from "./Shape.js";
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
  
  area() {
    let area = 0;
    if (this.points.length === 3) {
      const point0 = this.points[0];
      const point1 = this.points[1];
      const point2 = this.points[2];
      
      if (!point0 || !point1 || !point2) return 0;
      
      const midpoint = point2.clone().add(point0).divideScalar(2);
      area = 0.5 * point0.distanceTo(point2) * point1.distanceTo(midpoint);
    }
    return area;
  }
  get attributeData() {
    return [];
  }
}
