import * as THREE from "three/webgpu";
import WebGPUMeshLineGeometry from "./Geometry.js";
import WebGPUMeshLineMaterial from "./Material.js";
import {
  strokeProportionConfigToData,
  StrokeProportionConfig,
} from "../utils.js";
import { uniform } from "three/tsl";

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
  arrowSegmentStart: THREE.UniformNode<THREE.Vector3>;
  arrowSegmentEnd: THREE.UniformNode<THREE.Vector3>;
  arrowSegmentProportion: THREE.UniformNode<number>;
};

interface StrokeStyle {
  strokeColor?: THREE.Color;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDashLength?: number;
  strokeDashSpeed?: number;
  strokeDashOffset?: number;
  strokeProportion?: StrokeProportionConfig;
}

interface Config {
  color?: THREE.Color;
  opacity?: number;
  width?: number;
  dashLength?: number;
  dashSpeed?: number;
  dashPattern?: Array<number>;
  dashOffset?: number;
  startProportion?: number;
  endProportion?: number;
  arrow?: boolean;
  threeDimensions?: boolean;
}

const defaultConfig: Required<Config> = {
  color: new THREE.Color(0x000000),
  opacity: 1,
  width: 1,
  dashLength: 1,
  dashSpeed: 1,
  dashPattern: [1, 1],
  dashOffset: 0,
  startProportion: 0,
  endProportion: 1,
  arrow: false,
  threeDimensions: true,
};

const createUniforms = (
  geometry: WebGPUMeshLineGeometry,
  color: THREE.Color,
  opacity: number,
  width: number,
  dashLength: number,
  dashOffset: number,
  startProportion: number,
  endProportion: number,
  arrow: boolean,
): Uniforms => {
  const uniforms = {
    firstPoint: uniform(new THREE.Vector3()),
    secondPoint: uniform(new THREE.Vector3()),
    color: uniform(color),
    opacity: uniform(opacity),
    width: uniform(width),
    length: uniform(geometry.length),
    dashLength: uniform(dashLength),
    dashOffset: uniform(dashOffset),
    startProportion: uniform(startProportion),
    endProportion: uniform(endProportion),
    arrow: uniform(arrow ? 1 : 0),
    arrowSegmentStart: uniform(new THREE.Vector3()),
    arrowSegmentEnd: uniform(new THREE.Vector3()),
    arrowSegmentProportion: uniform(0),
  };

  // TODO: Update this after finishing arrow geometry
  geometry.getPoint(0, uniforms.firstPoint.value);
  geometry.getPoint(1, uniforms.secondPoint.value);
  if (arrow) {
    geometry.fillArrowSegmentData(endProportion, uniforms);
  }
  return uniforms;
};

export default class WebGPUMeshLine extends THREE.Mesh {
  constructor(points: Array<THREE.Vector3>, inputConfig: Config = {}) {
    const config = { ...defaultConfig, ...inputConfig };
    const geometry = new WebGPUMeshLineGeometry(points, config.arrow);
    const uniforms = createUniforms(
      geometry,
      config.color,
      config.opacity,
      config.width,
      config.dashLength,
      config.dashOffset,
      config.startProportion,
      config.endProportion,
      config.arrow,
    );
    const material = new WebGPUMeshLineMaterial(
      uniforms,
      config.dashSpeed,
      config.dashPattern,
      config.threeDimensions,
    );
    super(geometry, material);
  }

  restyle(style: StrokeStyle) {
    const {
      strokeColor,
      strokeOpacity,
      strokeWidth,
      strokeDashLength,
      strokeDashSpeed,
      strokeDashOffset,
      strokeProportion,
    } = style;
    if (strokeColor !== undefined) {
      this.material.uniforms.color.value.set(strokeColor);
    }
    if (strokeOpacity !== undefined) {
      this.material.uniforms.opacity.value = strokeOpacity;
    }
    if (strokeWidth !== undefined) {
      this.material.uniforms.width.value = strokeWidth;
    }
    if (strokeDashLength !== undefined) {
      this.material.uniforms.dashLength.value = strokeDashLength;
    }
    if (strokeDashSpeed !== undefined) {
      this.material.dashSpeed = strokeDashSpeed;
    }
    if (strokeDashOffset !== undefined) {
      this.material.uniforms.dashOffset.value = strokeDashOffset;
    }
    if (strokeProportion !== undefined) {
      const { strokeStartProportion, strokeEndProportion } =
        strokeProportionConfigToData(strokeProportion);
      this.material.uniforms.startProportion.value = strokeStartProportion;
      this.material.uniforms.endProportion.value = strokeEndProportion;
      this.geometry.fillArrowSegmentData(
        strokeEndProportion,
        this.material.uniforms,
      );
    }
  }
}
