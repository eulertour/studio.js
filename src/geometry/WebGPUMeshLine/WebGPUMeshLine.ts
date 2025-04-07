import * as THREE from "three/webgpu";
import WebGPUMeshLineGeometry from "./WebGPUMeshLineGeometry.js";
import VertexNode from "./shaders/vertex.js";
import FragmentNode from "./shaders/fragment.js";
import { uniform } from "three/tsl";

export const strokeColor = uniform(new THREE.Color());
export const strokeOpacity = uniform(1.0);
export const strokeWidth = uniform(4);
export const worldUnitsPerStrokeWidth = 0.05;
export const worldTime = uniform(0);
export const totalLength = uniform(0);

export default class WebGPUMeshLine extends THREE.Mesh {
  geometry: WebGPUMeshLineGeometry;
  material: THREE.MeshBasicNodeMaterial;

  constructor(points: THREE.Vector3[]) {
    const geometry = new WebGPUMeshLineGeometry();
    geometry.setPoints(points);
    totalLength.value = geometry.totalLength;

    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
    });
    material.vertexNode = VertexNode();
    material.fragmentNode = FragmentNode();

    super(geometry, material);
    this.geometry = geometry;
    this.material = material;
  }

  update(dt, t) {
    worldTime.value = t;
  }

  reshape(points: THREE.Vector3[]) {
    this.geometry.setPoints(points);
  }

  restyle(style: { color?: THREE.Color; opacity?: number; width?: number }) {
    const { color, opacity, width } = style;
    if (color !== undefined) {
      strokeColor.value.set(color);
    }
    if (opacity !== undefined) {
      strokeOpacity.value = opacity;
    }
    if (width !== undefined) {
      strokeWidth.value = width;
    }
  }
}
