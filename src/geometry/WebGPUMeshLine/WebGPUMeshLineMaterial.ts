import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import RougierVertexShader from "./shaders/vertex.js";
import RougierFragmentShader from "./shaders/fragment-rougier.js";
import { DashAtlas } from "./shaders/atlas-rougier.js";
import { ShaderNode } from "three/src/nodes/TSL.js";

type Uniforms = {
  strokeColor: ShaderNode<THREE.UniformNode<THREE.Color>>;
  strokeOpacity: ShaderNode<THREE.UniformNode<number>>;
  strokeWidth: ShaderNode<THREE.UniformNode<number>>;
  dashLength: ShaderNode<THREE.UniformNode<number>>;
}

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  strokeColor = uniform(new THREE.Color());
  strokeOpacity = uniform(1.0);
  strokeWidth = uniform(4);

  dashPattern = [1, 2];
  dashLength = uniform(0.5);
  dashAtlas: DashAtlas
  uniforms: Uniforms;

  constructor(
    strokeColor: THREE.Color,
    strokeOpacity: number,
    strokeWidth: number,
    dashPattern: number[],
    dashLength: number,
  ) {
    super({ transparent: true });

    this.uniforms = {
      strokeColor: uniform(strokeColor),
      strokeOpacity: uniform(strokeOpacity),
      strokeWidth: uniform(strokeWidth),
      dashLength: uniform(dashLength),
    }

    this.dashAtlas = new DashAtlas(dashPattern);
    this.vertexNode = RougierVertexShader(this.strokeWidth);
    const fragmentShader = new RougierFragmentShader(
      this.dashAtlas,
      this.strokeColor,
      this.strokeOpacity,
      this.strokeWidth,
      this.dashLength,
    );
    this.fragmentNode = fragmentShader.node();
  }
}
