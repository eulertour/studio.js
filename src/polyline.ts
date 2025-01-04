import { Style } from "./geometry.js";
import { THREE } from "./index.js";
import Shape from "./shape.js";
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
      this.copyStrokeFill(new Polyline(points, config));
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