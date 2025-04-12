import * as THREE from "three/webgpu";
import WebGPUMeshLineGeometry from "./WebGPUMeshLineGeometry.js";
import WebGPUMeshLineMaterial from "./WebGPUMeshLineMaterial.js";

export const worldUnitsPerStrokeWidth = 1 / 20;

export default class WebGPUMeshLine extends THREE.Mesh {
  constructor(
    public geometry: WebGPUMeshLineGeometry,
    public material: WebGPUMeshLineMaterial,
  ) {
    super(geometry, material);
  }
}
