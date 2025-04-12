import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import RougierVertexNode from "./shaders/vertex.js";
import RougierFragmentNode from "./shaders/fragment-rougier.js";

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  strokeColor = uniform(new THREE.Color());
  strokeOpacity = uniform(1.0);
  strokeWidth = uniform(4);

  constructor() {
    super({ transparent: true });
    this.vertexNode = RougierVertexNode(this.strokeWidth);
    this.fragmentNode = RougierFragmentNode(
      this.strokeColor,
      this.strokeOpacity,
      this.strokeWidth,
    );
  }
}
