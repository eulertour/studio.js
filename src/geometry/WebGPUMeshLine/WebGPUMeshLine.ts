import * as THREE from "three/webgpu";
import WebGPUMeshLineGeometry from "./WebGPUMeshLineGeometry.js";
import VertexNode from "./shaders/vertex.js";
import FragmentNode from "./shaders/fragment.js";

export default class WebGPUMeshLine extends THREE.Mesh {
  geometry: WebGPUMeshLineGeometry;
  material: THREE.MeshBasicNodeMaterial;

  constructor(points: THREE.Vector3[]) {
    const geometry = new WebGPUMeshLineGeometry();
    geometry.setPoints(points);

    const material = new THREE.MeshBasicNodeMaterial({
      fragmentNode: FragmentNode(),
      vertexNode: VertexNode(),
    });

    super(geometry, material);
    this.geometry = geometry;
    this.material = material;
  }

  reshape(points: THREE.Vector3[]) {
    this.geometry.setPoints(points);
  }
}
