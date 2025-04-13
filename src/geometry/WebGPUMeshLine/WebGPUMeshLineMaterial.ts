import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import VertexShader from "./shaders/VertexShader.js";
import FragmentShader from "./shaders/FragmentShader.js";
import DashAtlas from "./shaders/DashAtlas.js";

export type Uniforms = {
  firstPoint: THREE.UniformNode<THREE.Vector3>;
  secondPoint: THREE.UniformNode<THREE.Vector3>;
  color: THREE.UniformNode<THREE.Color>;
  opacity: THREE.UniformNode<number>;
  width: THREE.UniformNode<number>;
  length: THREE.UniformNode<number>;
  dashLength: THREE.UniformNode<number>;
  dashOffset: THREE.UniformNode<number>;
};

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  dashAtlas: DashAtlas;
  uniforms: Uniforms;
  dashSpeed: number;

  constructor(
    points: THREE.Vector3[],
    color: THREE.Color,
    opacity: number,
    width: number,
    dashLength: number,
    dashSpeed: number,
    dashPattern = [1, 1],
  ) {
    super({ transparent: true });
    this.dashSpeed = dashSpeed;

    this.dashAtlas = new DashAtlas(dashPattern);
    this.uniforms = this.createUniforms(
      points,
      color,
      opacity,
      width,
      dashLength,
    );
    this.vertexNode = new VertexShader(
      this.uniforms.firstPoint,
      this.uniforms.secondPoint,
      this.uniforms.width,
    ).node();
    this.fragmentNode = new FragmentShader(
      this.dashAtlas,
      this.uniforms.color,
      this.uniforms.opacity,
      this.uniforms.width,
      this.uniforms.length,
      this.uniforms.dashLength,
      this.uniforms.dashOffset,
    ).node();
  }

  createUniforms(
    points: THREE.Vector3[],
    color: THREE.Color,
    opacity: number,
    width: number,
    dashLength: number,
  ): Uniforms {
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];
      if (currentPoint === undefined) {
        throw new Error("Error iterating over points");
      }
      if (nextPoint === undefined) {
        throw new Error("Error iterating over points");
      }
      length += currentPoint.distanceTo(nextPoint);
    }

    const firstPoint = points[0];
    const secondPoint = points[1];
    if (firstPoint === undefined) {
      throw new Error("Error reading first point");
    }
    if (secondPoint === undefined) {
      throw new Error("Error reading second point");
    }

    return {
      firstPoint: uniform(firstPoint),
      secondPoint: uniform(secondPoint),
      color: uniform(color),
      opacity: uniform(opacity),
      width: uniform(width),
      length: uniform(length),
      dashLength: uniform(dashLength),
      dashOffset: uniform(0),
    };
  }

  update(t: number) {
    this.uniforms.dashOffset.value = t * this.dashSpeed;
  }

  dispose() {
    super.dispose();
    this.dashAtlas.atlas.dispose();
  }
}
