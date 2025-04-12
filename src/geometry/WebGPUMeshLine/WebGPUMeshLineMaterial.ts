import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import RougierVertexNode from "./shaders/vertex.js";
import { RougierFragmentShader } from "./shaders/fragment-rougier.js";

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  strokeColor = uniform(new THREE.Color());
  strokeOpacity = uniform(1.0);
  strokeWidth = uniform(4);

  constructor() {
    super({ transparent: true });
    this.vertexNode = RougierVertexNode(this.strokeWidth);

    const fragmentShader = new RougierFragmentShader(
      [1, 2],
      this.strokeColor,
      this.strokeOpacity,
      this.strokeWidth,
    );
    this.fragmentNode = fragmentShader.node();
  }
}
