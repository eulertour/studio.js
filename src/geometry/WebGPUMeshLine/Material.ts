import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import VertexShader from "./shaders/Vertex.js";
import FragmentShader from "./shaders/Fragment.js";
import DashAtlas from "./DashAtlas.js";
import { indexOrThrow } from "../../utils.js";
import { Uniforms } from "./index.js";

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  dashAtlas: DashAtlas;
  uniforms: Uniforms;
  dashSpeed: number;
  previousDashOffset = 0;

  constructor(
    uniforms: Uniforms,
    dashSpeed: number,
    dashPattern: number[],
    threeDimensions: boolean,
  ) {
    super({
      transparent: true,
      side: threeDimensions ? THREE.FrontSide : THREE.DoubleSide,
    });
    this.dashSpeed = dashSpeed;
    this.dashAtlas = new DashAtlas(dashPattern);
    this.uniforms = uniforms;
    this.vertexNode = new VertexShader(
      this.uniforms.width,
      this.uniforms.firstPoint,
      this.uniforms.secondPoint,
    ).node();
    this.fragmentNode = new FragmentShader(
      this.dashAtlas,
      this.uniforms.color,
      this.uniforms.opacity,
      this.uniforms.width,
      this.uniforms.length,
      this.uniforms.dashLength,
      this.uniforms.dashOffset,
      this.uniforms.startProportion,
      this.uniforms.endProportion,
      this.uniforms.arrow,
    ).node();
  }

  update(dt: number) {
    if (this.dashSpeed === 0) {
      return;
    }
    const currentCycleLength =
      this.dashAtlas.period.value * this.uniforms.dashLength.value;
    const offsetChange = dt * this.dashSpeed;
    let newOffset =
      (this.previousDashOffset + offsetChange) % currentCycleLength;
    this.uniforms.dashOffset.value = newOffset;
    this.previousDashOffset = newOffset;
  }

  dispose() {
    super.dispose();
    this.dashAtlas.atlas.dispose();
  }
}
