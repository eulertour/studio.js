import * as THREE from 'three/webgpu';
import WebGPUMeshLineGeometry from './Geometry.js';
import WebGPUMeshLineMaterial from './Material.js';

interface Config {
  color?: THREE.Color;
  opacity?: number;
  width?: number;
  dashLength?: number;
  dashSpeed?: number;
  dashPattern?: Array<number>;
  startProportion?: number;
  endProportion?: number;
  threeDimensions?: boolean;
};

const defaultConfig: Required<Config> = {
  color: new THREE.Color(0x000000),
  opacity: 1,
  width: 1,
  dashLength: 1,
  dashSpeed: 1,
  dashPattern: [1, 1],
  startProportion: 0,
  endProportion: 1,
  threeDimensions: true,
};

export default class WebGPUMeshLine extends THREE.Mesh {
  constructor(
    points: Array<THREE.Vector3>,
    inputConfig: Config = {},
  ) {
    const config = { ...defaultConfig, ...inputConfig };
    const geometry = new WebGPUMeshLineGeometry(points);
    const material = new WebGPUMeshLineMaterial(
      points,
      config.color,
      config.opacity,
      config.width,
      config.dashLength,
      config.dashSpeed,
      config.dashPattern,
      config.startProportion,
      config.endProportion,
      config.threeDimensions,
    );
    super(geometry, material);
  }
}