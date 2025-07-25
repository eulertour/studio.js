import Circle from "./Circle.js";
import { type Style } from "./utils.js";
import { ArcAttributes } from "./Arc.js";
import { THREE } from "../index.js";
import { ORIGIN } from "../utils.js";

/**
 * A small circle representing a precise location in space.
 *
 * @example point.ts
 */
export default class Point extends Circle {
  constructor(
    position: THREE.Vector2 | THREE.Vector3 = ORIGIN,
    config: Style & { radius?: number } = {},
  ) {
    config = {
      fillColor: new THREE.Color("black"),
      fillOpacity: 1,
      ...Point.defaultConfig(),
      ...config,
    };
    super(config.radius, config);
    this.position.set(position.x, position.y, 0);
  }

  static defaultConfig() {
    return { ...Circle.defaultConfig(), radius: 0.08 };
  }

  getAttributes(): ArcAttributes {
    return {
      radius: this.radius,
      angle: 2 * Math.PI,
      closed: false,
    };
  }

  static fromAttributes(): Point {
    return new Point(new THREE.Vector3());
  }
}
