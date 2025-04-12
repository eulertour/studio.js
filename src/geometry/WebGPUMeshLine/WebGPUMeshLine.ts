import * as THREE from "three/webgpu";
import WebGPUMeshLineGeometry from "./WebGPUMeshLineGeometry.js";
import { uniform } from "three/tsl";
import WebGPUMeshLineMaterial from "./WebGPUMeshLineMaterial.js";

export const worldTime = uniform(0);
export const worldUnitsPerStrokeWidth = 1 / 20;

export default class WebGPUMeshLine extends THREE.Mesh {
  geometry: WebGPUMeshLineGeometry;
  material: WebGPUMeshLineMaterial;

  constructor(points: THREE.Vector3[]) {
    const geometry = new WebGPUMeshLineGeometry(points);
    const material = new WebGPUMeshLineMaterial();

    super(geometry, material);
    this.geometry = geometry;
    this.material = material;
  }

  update(_: number, t: number) {
    worldTime.value = t;
  }

  reshape(points: THREE.Vector3[]) {
    this.geometry.setPoints(points);
  }

  restyle(style: { color?: THREE.Color; opacity?: number; width?: number }) {
    const { color, opacity, width } = style;
    if (color !== undefined) {
      this.material.strokeColor.value.set(color);
    }
    if (opacity !== undefined) {
      this.material.strokeOpacity.value = opacity;
    }
    if (width !== undefined) {
      this.material.strokeWidth.value = width;
    }
  }
}
