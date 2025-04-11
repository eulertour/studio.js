import * as THREE from "three";
import * as Utils from "../utils.js";
import * as Text from "../text.js";

// Define config interface for Number
interface NumberConfig {
  color?: THREE.ColorRepresentation;
  decimals?: number;
}

// Define the Number class
class Number extends THREE.Group {
  static geometries = Number.initializeGeometries();
  meshes: THREE.Mesh[] = [];
  material = new THREE.MeshBasicMaterial({ color: "black" });
  decimals: number;
  centerData = {
    center: new THREE.Vector3(),
    box: new THREE.Box3(),
    offset: new THREE.Vector3(),
    worldPosition: new THREE.Vector3(),
  };

  constructor(
    value = 0,
    config: NumberConfig = {},
  ) {
    const fullConfig = {
      color: config.color ?? "black",
      decimals: config.decimals ?? 2,
    };

    super();
    this.material.color = new THREE.Color(fullConfig.color);
    this.decimals = fullConfig.decimals;
    this.scale.set(0.0008, -0.0008, 0.0008);
    this.updateFromValue(value);
  }

  reshape(
    value: number,
    config: NumberConfig = {},
  ) {
    const fullConfig = {
      color: config.color ?? "black",
      decimals: config.decimals ?? 2,
    };
    this.material.color = new THREE.Color(fullConfig.color);
    this.decimals = fullConfig.decimals;
    this.clear(); // Clear previous meshes before adding new ones
    this.updateFromValue(value);
  }

  updateFromValue(value: number) {
    const characters = value.toFixed(this.decimals).split("");
    // Remove excess meshes if the new value has fewer characters
    while (this.meshes.length > characters.length) {
        const mesh = this.meshes.pop();
        if (mesh) {
            this.remove(mesh);
            // Optionally dispose geometry/material if not shared/reused
        }
    }
    this.children.length = this.meshes.length; // Sync children array

    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];

      if (character === undefined) {
        // This check might be redundant due to the loop condition
        console.warn(`Character at index ${i} is unexpectedly undefined.`);
        continue;
      }

      const geometry = Number.geometries.get(character);
      if (geometry === undefined) {
        console.error(`Character ${character} isn't supported in Number.`);
        continue; // Skip unsupported characters
      }

      let mesh = this.meshes[i];
      if (mesh !== undefined) {
        mesh.geometry = geometry;
      } else {
        mesh = new THREE.Mesh(geometry, this.material);
        this.meshes.push(mesh); // Add to meshes array first
        this.add(mesh); // Then add to the group's children
      }
    }

    // Adjust positions relative to each other
    for (let i = 1; i < this.children.length; i++) {
      const previousChild = this.children[i - 1];
      const currentChild = this.children[i];
      // Ensure both children exist before calling moveNextTo
      if (previousChild && currentChild && typeof (currentChild as any).moveNextTo === 'function') {
        (currentChild as any).moveNextTo(previousChild, Utils.RIGHT, 0.025);
      } else {
        console.warn("Missing child or moveNextTo function for positioning number characters");
      }
    }

    // Recalculate center and offset
    this.centerData.worldPosition.copy(this.position);
    this.localToWorld(this.centerData.worldPosition);

    // Ensure object has children before calculating bounding box
    if (this.children.length > 0) {
        this.centerData.box.setFromObject(this).getCenter(this.centerData.center);
        // Y might need adjustment depending on coordinate system
        // this.centerData.center.y *= -1; // Keep original logic if intended

        this.centerData.offset
          .subVectors(this.centerData.worldPosition, this.centerData.center)
          .multiplyScalar(1 / 0.0008); // Use the scale factor

        this.children.forEach((child) =>
          child.position.add(this.centerData.offset),
        );
    } else {
        // Reset center and offset if there are no children
        this.centerData.center.set(0,0,0);
        this.centerData.offset.set(0,0,0);
    }
  }

  // Safely extract geometry using optional chaining and type checking
  static extractGeometry(textShape: Text.Text): THREE.ShapeGeometry | undefined {
    const mesh = textShape.children[0]?.children[0]?.children[0];
    // Check if it's a Mesh and has ShapeGeometry
    if (mesh instanceof THREE.Mesh && mesh.geometry instanceof THREE.ShapeGeometry) {
      return mesh.geometry;
    }
    return undefined;
  }

  static initializeGeometries(): Map<string, THREE.ShapeGeometry> {
    const geometryMap = new Map<string, THREE.ShapeGeometry>();

    for (let i = 0; i < 10; i++) {
      const numberShape = new Text.Text(i.toString());
      const numberGeometry = Number.extractGeometry(numberShape);
      if (numberGeometry) {
        geometryMap.set(i.toString(), numberGeometry);
      }
    }

    const decimalShape = new Text.Text(".");
    const decimalGeometry = Number.extractGeometry(decimalShape);
    if (decimalGeometry) {
        geometryMap.set(".", decimalGeometry);
    }

    return geometryMap;
  }

  // Override clear to also clear the meshes array
  clear(): this {
      super.clear();
      this.meshes = [];
      return this;
  }
}

export { Number }; // Export the class
export type { NumberConfig }; // Export the type