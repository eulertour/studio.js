import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import RougierVertexNode from "./shaders/vertex.js";
import { RougierFragmentNode } from "./shaders/fragment-rougier.js";
import { PatternAtlas } from "./shaders/atlas-rougier.js";

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  strokeColor = uniform(new THREE.Color());
  strokeOpacity = uniform(1.0);
  strokeWidth = uniform(4);

  constructor() {
    super({ transparent: true });
    this.vertexNode = RougierVertexNode(this.strokeWidth);

    const patternAtlas = new PatternAtlas([1, 2]);
    const fragmentNode = new RougierFragmentNode(
      patternAtlas,
      this.strokeColor,
      this.strokeOpacity,
      this.strokeWidth,
    );
    this.fragmentNode = fragmentNode.node();
  }
}
