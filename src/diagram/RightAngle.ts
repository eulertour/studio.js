import * as THREE from "three";
import * as Geometry from "../geometry/index.js";

// Define config interface combining Style and specific properties
interface RightAngleConfig extends Geometry.Style {
  sideLength?: number;
}

// Define the RightAngle class
class RightAngle extends Geometry.Polyline {
  constructor(
    point1: THREE.Vector3,
    point2: THREE.Vector3,
    point3: THREE.Vector3,
    config: RightAngleConfig = {},
  ) {
    // Establish default for sideLength
    const sideLength = config.sideLength ?? 0.35;
    // Create a config object for super call, including the resolved sideLength
    // but sideLength is not a direct Polyline/Shape property, so don't pass it to super
    const polylineConfig = { ...config };

    const vector21 = new THREE.Vector3()
      .subVectors(point1, point2)
      .setLength(sideLength); // Use the resolved sideLength
    const vector23 = new THREE.Vector3()
      .subVectors(point3, point2)
      .setLength(sideLength); // Use the resolved sideLength

    // Call super with the calculated points and the filtered config
    super(
      [
        new THREE.Vector3().addVectors(point2, vector21),
        new THREE.Vector3().add(point2).add(vector21).add(vector23),
        new THREE.Vector3().addVectors(point2, vector23),
      ],
      polylineConfig, // Pass the config intended for Polyline/Shape
    );
  }
}

export { RightAngle }; // Export the class
export type { RightAngleConfig }; // Export the type