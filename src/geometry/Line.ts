import * as THREE from "three/webgpu";
import Shape from "./Shape.js";
import { type Style } from "./utils.js";

export type LineAttributes = {
  start: THREE.Vector3;
  end: THREE.Vector3;
};

/**
 * A segment between two points.
 *
 * @example line.ts
 */
export default class Line extends Shape {
  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: Style = {},
  ) {
    config = { ...Line.defaultConfig(), ...config };
    super([start, end], config);
    this.curveEndIndices = [[0, 1]];
  }

  static defaultConfig() {
    return { ...Shape.defaultConfig(), fill: false };
  }

  static centeredLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    config: Style = {},
  ) {
    const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
    const line = new Line(
      new THREE.Vector3().subVectors(start, center),
      new THREE.Vector3().subVectors(end, center),
      config,
    );
    line.position.copy(center);
    return line;
  }

  reshape(start: THREE.Vector3, end: THREE.Vector3, config: Style = {}) {
    this.start.copy(start);
    this.end.copy(end);
    this.copyStrokeAndFill(new Line(start, end, config));
  }

  length() {
    return this.start.distanceTo(this.end);
  }

  getClassConfig() {
    return {};
  }

  getAttributes(): LineAttributes {
    return {
      start: this.start,
      end: this.end,
    };
  }

  getVector(global = false) {
    this.updateWorldMatrix(true, false);
    return global
      ? new THREE.Vector3().subVectors(
          new THREE.Vector3().copy(this.end).applyMatrix4(this.matrixWorld),
          new THREE.Vector3().copy(this.start).applyMatrix4(this.matrixWorld),
        )
      : new THREE.Vector3().subVectors(this.end, this.start);
  }

  static fromAttributes(attributes: LineAttributes): Line {
    const { start, end } = attributes;
    return new Line(start, end);
  }
}
