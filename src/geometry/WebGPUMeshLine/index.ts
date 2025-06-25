import * as THREE from "three/webgpu";
import WebGPUMeshLineGeometry from "./Geometry.js";
import WebGPUMeshLineMaterial from "./Material.js";
import {
  strokeProportionConfigToData,
  StrokeProportionConfig,
  StrokeDashesConfig,
  StrokeArrowConfig,
  strokeDashesConfigToData,
} from "../utils.js";
import { uniform } from "three/tsl";
import { ViewportManager } from "../../ViewportManager.js";

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
  drawArrow: THREE.UniformNode<number>;
  arrowWidth: THREE.UniformNode<number>;
  arrowLength: THREE.UniformNode<number>;
  viewport: THREE.UniformNode<THREE.Vector4>;
  viewportSize: THREE.UniformNode<THREE.Vector2>;
  viewportOffset: THREE.UniformNode<THREE.Vector2>;
  devicePixelRatio: THREE.UniformNode<number>;
};

interface StrokeStyle {
  strokeColor?: THREE.Color;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDashes?: StrokeDashesConfig;
  strokeProportion?: StrokeProportionConfig;
  strokeArrow?: StrokeArrowConfig;
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
  drawArrow?: boolean;
  arrowWidth?: number;
  arrowLength?: number;
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
  drawArrow: false,
  arrowWidth: 1,
  arrowLength: 1,
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
  drawArrow: boolean,
  arrowWidth: number,
  arrowLength: number,
): Uniforms => {
  const viewportManager = ViewportManager.getInstance();
  const uniforms = {
    firstPoint: uniform(new THREE.Vector3()),
    secondPoint: uniform(new THREE.Vector3()),
    color: uniform(color),
    opacity: uniform(opacity),
    width: uniform(width),
    length: uniform(geometry.strokeLength),
    dashLength: uniform(dashLength),
    dashOffset: uniform(dashOffset),
    startProportion: uniform(startProportion),
    endProportion: uniform(endProportion),
    arrow: uniform(arrow ? 1 : 0),
    drawArrow: uniform(drawArrow ? 1 : 0),
    arrowWidth: uniform(arrowWidth),
    arrowLength: uniform(arrowLength),
    arrowSegmentStart: uniform(new THREE.Vector3()),
    arrowSegmentEnd: uniform(new THREE.Vector3()),
    arrowSegmentProportion: uniform(0),
    viewport: uniform(
      viewportManager.viewport || new THREE.Vector4(0, 0, 0, 0),
    ),
    viewportSize: uniform(viewportManager.getViewportSize()),
    viewportOffset: uniform(viewportManager.getViewportOffset()),
    devicePixelRatio: uniform(viewportManager.devicePixelRatio),
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
    const geometry = new WebGPUMeshLineGeometry(points);
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
      config.drawArrow,
      config.arrowWidth,
      config.arrowLength,
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
      strokeDashes,
      strokeArrow,
      strokeProportion,
    } = style;

    const setUniform = (uniform: keyof Uniforms, value: any) => {
      if (Array.isArray(this.material)) {
        this.material.forEach((material: any) => {
          if (
            (material as WebGPUMeshLineMaterial).uniforms &&
            (material as WebGPUMeshLineMaterial).uniforms[uniform]
          ) {
            (material as WebGPUMeshLineMaterial).uniforms[uniform].value =
              value;
          }
        });
      } else {
        if (
          (this.material as WebGPUMeshLineMaterial).uniforms &&
          (this.material as WebGPUMeshLineMaterial).uniforms[uniform]
        ) {
          (this.material as WebGPUMeshLineMaterial).uniforms[uniform].value =
            value;
        }
      }
    };

    if (strokeColor !== undefined) {
      setUniform("color", strokeColor);
    }
    if (strokeOpacity !== undefined) {
      setUniform("opacity", strokeOpacity);
    }
    if (strokeWidth !== undefined) {
      setUniform("width", strokeWidth);
    }
    if (strokeDashes !== undefined) {
      if (strokeDashes.length !== undefined) {
        const { strokeDashLength } = strokeDashesConfigToData({
          length: style.strokeDashes.length,
        });
        setUniform("dashLength", strokeDashLength);
      }
      if (strokeDashes.speed !== undefined) {
        const { strokeDashSpeed } = strokeDashesConfigToData({
          speed: style.strokeDashes.speed,
        });
        this.material.dashSpeed = strokeDashSpeed;
      }
      if (strokeDashes.offset !== undefined) {
        const { strokeDashOffset } = strokeDashesConfigToData({
          offset: style.strokeDashes.offset,
        });
        setUniform("dashOffset", strokeDashOffset);
      }
    }
    if (strokeProportion !== undefined) {
      const { strokeStartProportion, strokeEndProportion } =
        strokeProportionConfigToData(strokeProportion);
      setUniform("startProportion", strokeStartProportion);
      setUniform("endProportion", strokeEndProportion);

      if (this.geometry instanceof WebGPUMeshLineGeometry) {
        this.geometry.fillArrowSegmentData(
          strokeEndProportion,
          (this.material as any as WebGPUMeshLineMaterial).uniforms,
        );
      }
    }
  }

  update(dt: number) {
    // Update material's dash animation
    if (this.material instanceof WebGPUMeshLineMaterial) {
      this.material.update(dt);
    } else if (Array.isArray(this.material)) {
      this.material.forEach((material: any) => {
        if (material instanceof WebGPUMeshLineMaterial) {
          material.update(dt);
        }
      });
    }

    // Update viewport uniforms from singleton
    const viewportManager = ViewportManager.getInstance();
    const setUniform = (uniform: keyof Uniforms, value: any) => {
      if (Array.isArray(this.material)) {
        this.material.forEach((material: any) => {
          if (
            (material as WebGPUMeshLineMaterial).uniforms &&
            (material as WebGPUMeshLineMaterial).uniforms[uniform]
          ) {
            (material as WebGPUMeshLineMaterial).uniforms[uniform].value =
              value;
          }
        });
      } else {
        if (
          (this.material as WebGPUMeshLineMaterial).uniforms &&
          (this.material as WebGPUMeshLineMaterial).uniforms[uniform]
        ) {
          (this.material as WebGPUMeshLineMaterial).uniforms[uniform].value =
            value;
        }
      }
    };

    setUniform(
      "viewport",
      viewportManager.viewport || new THREE.Vector4(0, 0, 0, 0),
    );
    setUniform("viewportSize", viewportManager.getViewportSize());
    setUniform("viewportOffset", viewportManager.getViewportOffset());
    setUniform("devicePixelRatio", viewportManager.devicePixelRatio);
  }
}
