import * as THREE from "three/webgpu";
import Polyline from "./geometry/Polyline.js";
import { type Style } from "./geometry/index.js";

type CurveAttributes = {
  equation: () => void;
};

/**
 * A curve described by an equation.
 */
export class Curve extends Polyline {
  constructor(
    public equation: () => void,
    config: Style = {},
  ) {
    config = { ...Polyline.defaultConfig(), ...config };
    super([new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)], config);
  }

  static defaultConfig() {
    return { ...Polyline.defaultConfig() };
  }

  getClassConfig() {
    return {};
  }

  // getAttributes(): CurveAttributes {
  //   return {
  //     equation: this.equation,
  //   };
  // }
  //
  // static fromAttributes(attributes: CurveAttributes): Curve {
  //   const { equation } = attributes;
  //   return new Curve(equation);
  // }
}
