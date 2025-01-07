import Shape, { Style } from "./shape.js";
import { THREE } from "../index.js";
import { ERROR_THRESHOLD } from "../constants.js";
/**
 * A part of a circle's circumference.
 *
 * @example arc.ts
 */

export type ArcAttributes = {
  radius: number;
  angle: number;
  closed: boolean;
};

export default class Arc extends Shape {
  public closed: boolean;

  constructor(
    public radius = 1,
    public angle: number = Math.PI / 2,
    config: Style & { closed?: boolean } = {},
  ) {
    config = { ...Arc.defaultConfig(), ...config };
    let points = [];
    let negative = false;
    if (angle < 0) {
      negative = true;
      angle *= -1;
    }
    if (angle > 0) {
      for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
        points.push(
          new THREE.Vector3(
            radius * Math.cos(i),
            radius * Math.sin(i) * (negative ? -1 : 1),
            0,
          ),
        );
      }
    } else {
      points.push(
        new THREE.Vector3(radius, 0, 0),
        new THREE.Vector3(radius, 0, 0),
      );
    }
    if (config.closed) {
      points = [
        new THREE.Vector3(0, 0, 0),
        ...points,
        new THREE.Vector3(0, 0, 0),
      ];
    }
    super(points, config);
    this.closed = config.closed;
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

  static defaultConfig() {
    return { ...Shape.defaultConfig(), closed: false, fill: false };
  }

  reshape(
    radius = 1,
    angle: number = Math.PI / 2,
    config: Style & { closed?: boolean } = {},
  ) {
    this.radius = radius;
    this.angle = angle;
    this.copyStrokeFill(new Arc(radius, angle, config));
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
