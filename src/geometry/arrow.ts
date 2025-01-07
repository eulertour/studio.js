import * as THREE from "three";
import { type Style } from "./shape.js";
import Line from "./line.js";

/**
 * An arrow derived from a line.
 *
 * @example arrow.ts
 */
export default class Arrow extends Line {
  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: Style = {},
  ) {
    super(start, end, { ...Arrow.defaultConfig(), ...config, arrow: true });
  }

  reshape(start: THREE.Vector3, end: THREE.Vector3, config: Style = {}) {
    this.start.copy(start);
    this.end.copy(end);
    this.copyStrokeFill(new Arrow(start, end, config));
  }
}

