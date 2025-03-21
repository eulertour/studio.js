import Shape, { Style } from "./Shape.js";
import { THREE } from "../index.js";
import { PolygonAttributes } from "./Polygon.js";

/**
 * A series of connected line segments.
 *
 * @example polyline.ts
 */
export default class Polyline extends Shape {
  constructor(points: Array<THREE.Vector3>, config: Style = {}) {
    super(points, { ...Polyline.defaultConfig(), ...config, fillOpacity: 0 });

    this.curveEndIndices = [[0, 1]];
  }

  static defaultConfig() {
    return { ...Shape.defaultConfig(), fill: false };
  }

  getClassConfig() {
    return {};
  }

  getAttributes(): PolygonAttributes {
    return {
      points: this.points,
    };
  }

  static fromAttributes(attributes: PolygonAttributes): Polyline {
    const { points } = attributes;
    return new Polyline(points);
  }
}
