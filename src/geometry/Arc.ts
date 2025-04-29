import Shape from "./Shape.js";
import { type Style } from "./utils.js";
import { THREE } from "../index.js";
import { ERROR_THRESHOLD } from "../constants.js";
import { getArcPoints } from "./geometryUtils.js";

export type ArcAttributes = {
  radius: number;
  angle: number;
  closed: boolean;
};
/**
 * An arc.
 *
 * @example arc.ts
 */
export default class Arc extends Shape {
  public closed: boolean;

  constructor(
    public radius = 1,
    public angle: number = Math.PI / 2,
    config: Style & { closed?: boolean } = {},
  ) {
    config = { ...Arc.defaultConfig(), ...config };
    let points = getArcPoints(radius, angle, { closed: config.closed });

    super(points, config);

    this.closed = config.closed ?? false;
    if (this.closed) {
      this.curveEndIndices = [
        [0, 1],
        [1, points.length - 2],
        [points.length - 2, points.length - 1],
      ];
    } else {
      this.curveEndIndices = [[0, points.length - 1]];
    }
  }

  reshape(
    radius = 1,
    angle: number = Math.PI / 2,
    config: Style & { closed?: boolean } = {},
  ) {
    this.radius = radius;
    this.angle = angle;
    this.copyStrokeAndFill(new Arc(radius, angle, config));
  }

  getCloneAttributes() {
    return [this.radius, this.angle, this.closed];
  }

  getAttributes(): ArcAttributes {
    return {
      radius: this.radius,
      angle: this.angle,
      closed: this.closed,
    };
  }

  static fromAttributes(attributes: ArcAttributes): Arc {
    const { radius, angle, closed } = attributes;
    return new Arc(radius, angle, { closed });
  }

  get attributeData() {
    return [
      {
        attribute: "radius",
        type: "number",
        default: 1,
      },
      {
        attribute: "angle",
        type: "angle",
        default: 45,
      },
      {
        attribute: "closed",
        type: "boolean",
        default: false,
      },
    ];
  }

  getDimensions() {
    const worldDiameter = 2 * this.radius * this.scale.x;
    return new THREE.Vector2(worldDiameter, worldDiameter);
  }
}
