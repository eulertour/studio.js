import * as THREE from "three/webgpu";
import WebGPUMeshLineGeometry from "./WebGPUMeshLineGeometry.js";
import { uniform } from "three/tsl";
import WebGPUMeshLineMaterial from "./WebGPUMeshLineMaterial.js";

export const worldTime = uniform(0);
export const worldUnitsPerStrokeWidth = 1 / 20;

export default class WebGPUMeshLine extends THREE.Mesh {
  geometry: WebGPUMeshLineGeometry;
  material: WebGPUMeshLineMaterial;

  constructor(
    points: THREE.Vector3[],
    strokeColor: THREE.Color,
    strokeOpacity: number,
    strokeWidth: number,
    dashLength: number,
  ) {
    const geometry = new WebGPUMeshLineGeometry(points);
    const material = new WebGPUMeshLineMaterial(
      strokeColor,
      strokeOpacity,
      strokeWidth,
      dashLength,
      [1, 2],
    );

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
}
