import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import { RougierVertexShader } from "./shaders/RougierVertexShader.js";
import RougierFragmentShader from "./shaders/RougierFragmentShader.js";
import DashAtlas from "./shaders/DashAtlas.js";

export type Uniforms = {
  firstPosition: THREE.UniformNode<THREE.Vector3>;
  secondPosition: THREE.UniformNode<THREE.Vector3>;
  strokeColor: THREE.UniformNode<THREE.Color>;
  strokeOpacity: THREE.UniformNode<number>;
  strokeWidth: THREE.UniformNode<number>;
  dashLength: THREE.UniformNode<number>;
  dashOffset: THREE.UniformNode<number>;
  totalLength: THREE.UniformNode<number>;
}

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  dashAtlas: DashAtlas
  uniforms: Uniforms;

  constructor(
    points: THREE.Vector3[],
    strokeColor: THREE.Color,
    strokeOpacity: number,
    strokeWidth: number,
    dashLength: number,
    public dashSpeed: number,
    dashPattern = [1, 1],
  ) {
    super({ transparent: true });

    this.uniforms = this.createUniforms(
      points,
      strokeColor,
      strokeOpacity,
      strokeWidth,
      dashLength,
    );

    this.dashAtlas = new DashAtlas(dashPattern);
    this.vertexNode = new RougierVertexShader(
      this.uniforms.firstPosition,
      this.uniforms.secondPosition,
      this.uniforms.strokeWidth,
    ).node();
    this.fragmentNode = new RougierFragmentShader(
      this.dashAtlas,
      this.uniforms.strokeColor,
      this.uniforms.strokeOpacity,
      this.uniforms.strokeWidth,
      this.uniforms.totalLength,
      this.uniforms.dashLength,
      this.uniforms.dashOffset,
    ).node();
  }

  createUniforms(
    points: THREE.Vector3[],
    strokeColor: THREE.Color,
    strokeOpacity: number,
    strokeWidth: number,
    dashLength: number,
  ): Uniforms {
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];
      if (currentPoint === undefined) { throw new Error("Error iterating over points") }
      if (nextPoint === undefined) { throw new Error("Error iterating over points") }
      totalLength += currentPoint.distanceTo(nextPoint);
    }

    const firstPoint = points[0];
    const secondPoint = points[1];
    if (firstPoint === undefined) { throw new Error("Error reading first point") }
    if (secondPoint === undefined) { throw new Error("Error reading second point") }

    return {
      firstPosition: uniform(firstPoint),
      secondPosition: uniform(secondPoint),
      strokeColor: uniform(strokeColor),
      strokeOpacity: uniform(strokeOpacity),
      strokeWidth: uniform(strokeWidth),
      dashLength: uniform(dashLength),
      dashOffset: uniform(0),
      totalLength: uniform(totalLength),
    };
  }

  update(t: number) {
    this.uniforms.dashOffset.value = t * this.dashSpeed;
  }
}
