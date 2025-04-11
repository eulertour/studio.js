import * as THREE from "three";
import * as Geometry from "../geometry/index.js";
import Angle from "./Angle.js";
import { Shape } from "../geometry/index.js";

// Define config interface combining Style and specific properties
interface CongruentAngleConfig extends Geometry.Style {
  minRadius?: number;
  spacing?: number;
}

// Define the CongruentAngle class
class CongruentAngle extends Shape {
  constructor(
    public arcs: number,
    public point1: THREE.Vector3,
    public point2: THREE.Vector3,
    public point3: THREE.Vector3,
    config: CongruentAngleConfig = {},
  ) {
    // Resolve defaults for properties used locally
    const minRadius = config.minRadius ?? 0.4;
    const spacing = config.spacing ?? 0.15;
    // Pass the original config to super, disabling stroke/fill for the container
    super([], { stroke: false, fill: false, ...config });

    // Create the group for child arcs
    this.intrinsicChildren = new THREE.Group();
    for (let i = 0; i < arcs; i++) {
      // Use resolved defaults when creating child Angles
      const arc = new Angle(point1, point2, point3, {
        radius: minRadius + i * spacing,
        // Pass the original config down to the child Angles for styling
        ...config,
      });
      this.intrinsicChildren.add(arc);
    }

    this.add(this.intrinsicChildren);
  }

  // Method to get attributes
  getAttributes() {
    return {
      arcs: this.arcs,
      point1: this.point1,
      point2: this.point2,
      point3: this.point3,
      // Note: config is not typically returned in getAttributes unless needed
    };
  }
}

export { CongruentAngle }; // Export the class
export type { CongruentAngleConfig }; // Export the type
