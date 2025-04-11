import * as THREE from "three";
import * as Geometry from "../geometry/index.js";

// Define config interface combining Style and specific properties
interface CongruentLineConfig extends Geometry.Style {
  tickLength?: number;
  spacing?: number;
}

// Define the CongruentLine class
class CongruentLine extends THREE.Group {
  constructor(
    ticks: number,
    start: THREE.Vector3,
    end: THREE.Vector3,
    config: CongruentLineConfig = {},
  ) {
    // Establish defaults for tickLength and spacing
    const tickLength = config.tickLength ?? 0.25;
    const spacing = config.spacing ?? 0.15;
    // Use a combined config object for passing to Geometry.Line
    const lineConfig = { ...config, tickLength, spacing };

    super();
    const left = -(spacing * (ticks - 1)) / 2;
    for (let i = 0; i < ticks; i++) {
      const pos = left + spacing * i;
      const tick = new Geometry.Line(
        new THREE.Vector3(pos, -tickLength / 2, 0),
        new THREE.Vector3(pos, tickLength / 2, 0),
        lineConfig, // Pass the merged config
      );
      this.add(tick);
    }

    this.moveToSegment(start, end);
  }

  // Move the group to align with the segment defined by start and end points
  moveToSegment(start: THREE.Vector3, end: THREE.Vector3): void {
    const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
    this.position.copy(center);

    const segmentVector = new THREE.Vector3().subVectors(end, start);
    this.rotation.z = Math.atan2(segmentVector.y, segmentVector.x);
  }
}

export { CongruentLine }; // Export the class
export type { CongruentLineConfig }; // Export the type