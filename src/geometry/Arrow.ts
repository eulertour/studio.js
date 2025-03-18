import * as THREE from "three/webgpu";
import Shape, { type Style } from "./Shape.js";

export type ArrowAttributes = {
  start: THREE.Vector3;
  end: THREE.Vector3;
};

/**
 * An arrow.
 *
 * @example arrow.ts
 */
export default class Arrow extends Shape {
  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: Style = {},
  ) {
    super([start, end], { ...Arrow.defaultConfig(), ...config, arrow: true });
  }

  reshape(start: THREE.Vector3, end: THREE.Vector3, config: Style = {}) {
    this.start.copy(start);
    this.end.copy(end);
    this.copyStrokeAndFill(new Arrow(start, end, config));
  }

  getAttributes(): ArrowAttributes {
    return {
      start: this.start,
      end: this.end,
    };
  }
}
