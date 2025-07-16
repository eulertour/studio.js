import * as THREE from "three/webgpu";
import * as Geometry from "../geometry/index.js";
import Angle from "./Angle.js";
import Shape from "../geometry/Shape.js";

export default class CongruentAngle extends Shape {
  constructor(
    public arcs: number,
    public point1: THREE.Vector3,
    public point2: THREE.Vector3,
    public point3: THREE.Vector3,
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

    this.intrinsicChildren = new THREE.Group();
    for (let i = 0; i < arcs; i++) {
      const arc = new Angle(point1, point2, point3, {
        radius: config.minRadius + i * config.spacing,
        ...config,
      });
      this.intrinsicChildren.add(arc);
    }

    this.add(this.intrinsicChildren);
  }

  getAttributes() {
    return {
      arcs: this.arcs,
      point1: this.point1,
      point2: this.point2,
      point3: this.point3,
    };
  }
}
