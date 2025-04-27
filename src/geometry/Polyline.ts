import Shape from "./Shape.js";
import { Style } from "./utils.js";
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

  reshape(points: Array<THREE.Vector3>, config: Style = {}) {
    const newConfig = { ...this.getStyle(), ...config };
    this.stroke.geometry.setPoints(points, false);
    this.restyle(newConfig);
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
