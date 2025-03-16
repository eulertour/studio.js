import * as THREE from "three";
import * as Geometry from "../geometry/index.js";
import Angle from "./Angle.js";

export default class CongruentAngle extends THREE.Group {
  constructor(
    arcs: number,
    point1: THREE.Vector3,
    point2: THREE.Vector3,
    point3: THREE.Vector3,
    public config: Geometry.Style & {
      minRadius?: number;
      spacing?: number;
    } = {},
  ) {
    config = {
      minRadius: 0.4,
      spacing: 0.15,
      ...config,
    };

    super();
    for (let i = 0; i < arcs; i++) {
      const arc = new Angle(point1, point2, point3, {
        radius: config.minRadius + i * config.spacing,
        ...config,
      });
      this.add(arc);
    }
  }
}
