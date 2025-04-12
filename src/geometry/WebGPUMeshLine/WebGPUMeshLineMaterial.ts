import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import RougierVertexShader from "./shaders/vertex.js";
import RougierFragmentShader from "./shaders/fragment-rougier.js";
import { DashAtlas } from "./shaders/atlas-rougier.js";

type Uniforms = {
  strokeColor: THREE.UniformNode<THREE.Color>;
  strokeOpacity: THREE.UniformNode<number>;
  strokeWidth: THREE.UniformNode<number>;
  dashLength: THREE.UniformNode<number>;
  worldTime: THREE.UniformNode<number>;
}

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  dashAtlas: DashAtlas
  uniforms: Uniforms;

  constructor(
    strokeColor: THREE.Color,
    strokeOpacity: number,
    strokeWidth: number,
    dashLength: number,
    dashPattern: number[],
  ) {
    super({ transparent: true });

    this.uniforms = {
      strokeColor: uniform(strokeColor),
      strokeOpacity: uniform(strokeOpacity),
      strokeWidth: uniform(strokeWidth),
      dashLength: uniform(dashLength),
      worldTime: uniform(0),
    }

    this.dashAtlas = new DashAtlas(dashPattern);
    this.vertexNode = RougierVertexShader(strokeWidth);
    const fragmentShader = new RougierFragmentShader(
      this.dashAtlas,
      this.uniforms.strokeColor,
      this.uniforms.strokeOpacity,
      this.uniforms.strokeWidth,
      this.uniforms.dashLength,
      this.uniforms.worldTime,
    );
    this.fragmentNode = fragmentShader.node();
  }
}
