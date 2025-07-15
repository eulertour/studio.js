import Shape, { Style } from "./Shape.js";
import { THREE } from "../index.js";
import { getEllipseArcPoints } from "./geometryUtils.js";
import Arc from "./Arc.js";

export type EllipseArcAttributes = {
    radiusA: number;
    radiusB: number;
    angle: number;
    closed: boolean;
};

/**
 * EllipseArc
 *
 * @example ellipseArc.ts
 */ 

export default class EllipseArc extends Shape {
    public closed: boolean;

    constructor(
        public radiusA = 1,
        public radiusB = 2, 
        public angle = Math.PI / 2, 
        config: Style & { closed?: boolean } = {},
    ) {
        config = { ...Arc.defaultConfig(), ...config };
        let points = getEllipseArcPoints(radiusA, radiusB, angle, { closed: config.closed });

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
        radiusA = 1,
        radiusB = 2,
        angle = Math.PI / 2,
        config: Style & { closed?: boolean } = {},
      ) {
        this.radiusA = radiusA;
        this.radiusB = radiusB;
        this.angle = angle;
        this.copyStrokeAndFill(new EllipseArc(radiusA, radiusB, angle, config));
      }



      getCloneAttributes() {
        return [this.radiusA, this.radiusB, this.angle, this.closed];
      }

      getAttributes(): EllipseArcAttributes {
        return {
          radiusA: this.radiusA,
          radiusB: this.radiusB,
          angle: this.angle,
          closed: this.closed,
        };
      }


      static fromAttributes(attributes: EllipseArcAttributes): EllipseArc {
        const { radiusA, radiusB, angle, closed } = attributes;
        return new EllipseArc(radiusA, radiusB, angle, { closed });
      }


      get attributeData() {
        return [
          {
            attribute: "radiusA",
            type: "number",
            default: 1,
          },
          {
            attribute: "radiusB",
            type: "number",
            default: 2,
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
        const worldDiameter = 2 * this.radiusB * this.scale.x;
        return new THREE.Vector2(worldDiameter, worldDiameter);
      }
    }