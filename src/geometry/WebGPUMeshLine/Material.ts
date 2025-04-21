import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import VertexShader from "./shaders/Vertex.js";
import FragmentShader from "./shaders/Fragment.js";
import DashAtlas from "./DashAtlas.js";
import { indexOrThrow } from "../../utils.js";

export type Uniforms = {
  firstPoint: THREE.UniformNode<THREE.Vector3>;
  secondPoint: THREE.UniformNode<THREE.Vector3>;
  color: THREE.UniformNode<THREE.Color>;
  opacity: THREE.UniformNode<number>;
  width: THREE.UniformNode<number>;
  length: THREE.UniformNode<number>;
  dashLength: THREE.UniformNode<number>;
  dashOffset: THREE.UniformNode<number>;
  startProportion: THREE.UniformNode<number>;
  endProportion: THREE.UniformNode<number>;
  arrow: THREE.UniformNode<number>;
};

export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
  dashAtlas: DashAtlas;
  uniforms: Uniforms;
  dashSpeed: number;
  previousDashOffset = 0;

  constructor(
    points: THREE.Vector3[],
    color: THREE.Color,
    opacity: number,
    width: number,
    dashLength: number,
    dashSpeed: number,
    dashPattern: number[],
    dashOffset: number,
    startProportion: number,
    endProportion: number,
    arrow: boolean,
    threeDimensions: boolean,
  ) {
    super({
      transparent: true,
      side: threeDimensions ? THREE.FrontSide : THREE.DoubleSide,
    });
    this.dashSpeed = dashSpeed;
    this.dashAtlas = new DashAtlas(dashPattern);
    this.uniforms = this.createUniforms(
      points,
      color,
      opacity,
      width,
      dashLength,
      dashOffset,
      startProportion,
      endProportion,
      arrow,
    );
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

  createUniforms(
    points: THREE.Vector3[],
    color: THREE.Color,
    opacity: number,
    width: number,
    dashLength: number,
    dashOffset: number,
    startProportion: number,
    endProportion: number,
    arrow: boolean,
  ): Uniforms {
    let length = 0;
    for (let i = 0; i < points.length - 2; i++) {
      const currentPoint = indexOrThrow(points, i);
      const nextPoint = indexOrThrow(points, i + 1);
      length += currentPoint.distanceTo(nextPoint);
    }

    const firstPoint = indexOrThrow(points, 0);
    const secondPoint = indexOrThrow(points, 1);
    return {
      firstPoint: uniform(firstPoint),
      secondPoint: uniform(secondPoint),
      color: uniform(color),
      opacity: uniform(opacity),
      width: uniform(width),
      length: uniform(length),
      dashLength: uniform(dashLength),
      dashOffset: uniform(dashOffset),
      startProportion: uniform(startProportion),
      endProportion: uniform(endProportion),
      arrow: uniform(arrow ? 1 : 0),
    };
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
