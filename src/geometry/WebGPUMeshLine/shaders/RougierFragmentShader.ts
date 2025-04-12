import {
  Discard,
  Fn,
  If,
  ShaderNodeObject,
  attribute,
  dot,
  float,
  max,
  screenCoordinate,
  screenSize,
  sign,
  sqrt,
  texture,
  varyingProperty,
  vec2,
  vec4,
} from "three/tsl";
import OperatorNode from "three/src/nodes/math/OperatorNode.js";
import { ShaderNodeFn } from "three/src/nodes/TSL.js";
import { UNITS_PER_STROKE_WIDTH } from "../../../constants.js";
import DashAtlas from "./DashAtlas.js";
import { Uniforms } from "../WebGPUMeshLineMaterial.js";
import { UniformNode } from "three/webgpu";

const lengthSquared = Fn(([vector]: [ShaderNodeObject<OperatorNode>]) =>
  dot(vector, vector),
);

const segmentCoversFragment = Fn(
  ([
    halfWidthSquared,
    segmentVec,
    startToFrag,
    endToFrag,
    dotProduct,
    segmentProjection,
    segmentNormal,
  ]: [
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
  ]) => {
    const segmentStart = lengthSquared(startToFrag).lessThan(halfWidthSquared);
    const segmentEnd = lengthSquared(endToFrag).lessThan(halfWidthSquared);
    const segmentStem = dotProduct
      .greaterThan(0)
      .and(lengthSquared(segmentProjection).lessThan(lengthSquared(segmentVec)))
      .and(lengthSquared(segmentNormal).lessThan(halfWidthSquared));
    return segmentStem.or(segmentStart).or(segmentEnd);
  },
);

// [cssViewportWidth, cssViewportHeight, ?] * devicePixelRatio
// [1280, 720] * devicePixelRatio
// [1408, 792]
const glFragCoord = Fn(() =>
  vec2(screenCoordinate.x, screenSize.y.sub(screenCoordinate.y)),
);

const projectOntoVector = Fn(
  ([vectorToProject, vectorToProjectOnto]: [
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
  ]) => {
    const bHat = vectorToProjectOnto.normalize();
    return vectorToProject.dot(bHat).mul(bHat);
  },
);

const transformToBasis = Fn(
  ([input, basis]: [
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
  ]) => {
    const tangent = projectOntoVector(input, basis);
    const normal = input.sub(tangent);
    return vec4(tangent, normal);
  },
);

const rotate90 = Fn(([vector]: [ShaderNodeObject<OperatorNode>]) =>
  vec2(vector.y.negate(), vector.x),
);

export default class RougierFragmentShader {
  node: ShaderNodeFn<[]>;

  constructor(
    public dashAtlas: DashAtlas,
    strokeColor: UniformNode<number>,
    strokeOpacity: UniformNode<number>,
    strokeWidth: UniformNode<number>,
    totalLength: UniformNode<number>,
    dashLength: UniformNode<number>,
    worldTime: UniformNode<number>,
  ) {
    this.node = Fn(() => {
      const startFragment = varyingProperty("vec2", "vStartFragment");
      const endFragment = varyingProperty("vec2", "vEndFragment");

      const segmentVector = endFragment.sub(startFragment);
      const fragmentVector = glFragCoord().sub(startFragment);
      const basis = transformToBasis(fragmentVector, segmentVector);
      const tangentVector = basis.xy;
      const normalVector = basis.zw;

      const startLength = float(totalLength).mul(attribute("startProportion"));
      const endLength = float(totalLength).mul(attribute("endProportion"));
      const segmentDistancePerFragment = endLength
        .sub(startLength)
        .div(segmentVector.length());
      const segmentFragmentsPerDistance = float(1).div(
        segmentDistancePerFragment,
      );

      const xOffset = tangentVector
        .length()
        .mul(segmentDistancePerFragment)
        .mul(sign(dot(segmentVector, tangentVector)))
        .add(startLength);
      const yOffset = normalVector
        .length()
        .mul(segmentDistancePerFragment)
        .mul(sign(dot(rotate90(segmentVector), normalVector)));

      const dashPeriod = this.dashAtlas.period;
      const freqPatternLength = dashPeriod.mul(dashLength);
      // TODO: Some corner error with time = 0 on a square with side length 2
      // const dashPhase = float(0);
      const dashPhase = float(0).sub(worldTime);
      const u = xOffset.add(dashPhase.mul(dashLength)).mod(freqPatternLength);
      const u2 = xOffset.add(dashPhase.mul(dashLength)).mod(freqPatternLength);
      const v = texture(this.dashAtlas.atlas, vec2(u2.div(freqPatternLength), 0));
      const dashCenterReferencePoint = v.x.mul(255).mul(dashLength);
      const dashType = v.y;
      const _start = v.z.mul(255).mul(dashLength);
      const _stop = v.a.mul(255).mul(dashLength);
      const dashStart = xOffset.sub(u).add(_start);
      const dashStop = xOffset.sub(u).add(_stop);
      const lineStart = float(0);
      const lineStop = totalLength;
      const segmentStart = startLength;
      const segmentStop = endLength;

      const color = vec4(1, 0, 0, 1).toVar();
      const blue = vec4(0, 0, 1, 0.5);

      const halfWidth = float(1 / 2)
        .mul(strokeWidth)
        .mul(UNITS_PER_STROKE_WIDTH);
      If(dashStop.lessThanEqual(lineStart), () => {
        Discard();
      });
      If(dashStart.greaterThanEqual(lineStop), () => {
        Discard();
      });

      // Line start
      If(
        xOffset
          .lessThanEqual(lineStart)
          .and(dashStart.lessThanEqual(lineStart))
          .and(dashStop.greaterThanEqual(lineStart)),
        () => {
          // u.assign(dx.abs());
          const newU = xOffset.abs();
          If(
            sqrt(newU.mul(newU).add(yOffset.mul(yOffset))).lessThanEqual(
              halfWidth,
            ),
            () => {
              color.assign(blue);
            },
          ).Else(() => {
            Discard();
          });
        },
      )
        // Line end
        .ElseIf(
          xOffset
            .greaterThanEqual(lineStop)
            .and(dashStop.greaterThanEqual(lineStop))
            .and(dashStart.lessThanEqual(lineStop)),
          () => {
            // u.assign(dx.sub(lineStop));
            const newU = xOffset.sub(lineStop);
            If(
              sqrt(newU.mul(newU).add(yOffset.mul(yOffset))).lessThanEqual(
                halfWidth,
              ),
              () => {
                color.assign(blue);
              },
            ).Else(() => {
              Discard();
            });
            // color.assign(purple);
          },
        )
        // Dash body
        .ElseIf(dashType.equal(0), () => {
          If(yOffset.abs().lessThanEqual(halfWidth), () => {
            color.assign(blue);
          }).Else(() => {
            Discard();
          });
        })
        // Dash end
        .ElseIf(dashType.equal(1), () => {
          // -1
          const newU = max(u.sub(dashCenterReferencePoint), 0);
          // u.assign(max(u.sub(dashCenterReferencePoint), 0));
          If(
            sqrt(newU.mul(newU).add(yOffset.mul(yOffset))).lessThanEqual(
              halfWidth,
            ),
            () => {
              color.assign(blue);
            },
          ).Else(() => {
            Discard();
          });
        })
        // Dash start
        .ElseIf(dashType.greaterThan(0), () => {
          // +1
          // u.assign(max(dashCenterReferencePoint.sub(u), 0));
          const newU = max(dashCenterReferencePoint.sub(u), 0);
          If(
            sqrt(newU.mul(newU).add(yOffset.mul(yOffset))).lessThanEqual(
              halfWidth,
            ),
            () => {
              color.assign(blue);
            },
          ).Else(() => {
            Discard();
          });
        });

      // Outgoing from join
      If(segmentStart.notEqual(lineStart), () => {
        // TODO: distancePerFragment was calcuated based on the
        // 3D length of the current segment. This calculation
        // should use a new constant based on the 3D length of
        // the previous segment.
        If(dashStart.lessThanEqual(segmentStart), () => {
          const previousFragment = varyingProperty("vec2", "vPreviousFragment");
          const startToPrevious = vec2(
            previousFragment.sub(startFragment),
          ).toVar();

          const previousSegmentDashStartDistance = segmentStart.sub(dashStart);
          const previousSegmentDashStartFragment = startFragment.add(
            startToPrevious
              .normalize()
              .mul(previousSegmentDashStartDistance)
              .mul(segmentFragmentsPerDistance),
          );
          const fragmentHalfWidth = halfWidth.mul(segmentFragmentsPerDistance);
          const halfWidthSquared = fragmentHalfWidth.mul(fragmentHalfWidth);
          const segmentVec = startFragment.sub(
            previousSegmentDashStartFragment,
          );
          const startToFrag = glFragCoord().sub(
            previousSegmentDashStartFragment,
          );
          const endToFrag = glFragCoord().sub(startFragment);
          const dotProduct = segmentVec.dot(startToFrag);
          const segmentProjection = startToFrag
            .dot(segmentVec)
            .div(segmentVec.dot(segmentVec))
            .mul(segmentVec);
          const segmentNormal = startToFrag.sub(segmentProjection);
          If(
            segmentCoversFragment(
              halfWidthSquared,
              segmentVec,
              startToFrag,
              endToFrag,
              dotProduct,
              segmentProjection,
              segmentNormal,
            ),
            () => {
              Discard();
            },
          );
          If(xOffset.lessThanEqual(segmentStart), () => {
            Discard();
          });
        });
      });

      // Incoming to join
      If(segmentStop.notEqual(lineStop), () => {
        If(dashStart.greaterThanEqual(segmentStop), () => {
          Discard();
        });
        If(
          xOffset
            .greaterThanEqual(segmentStop)
            .and(dashStop.greaterThanEqual(segmentStop))
            .and(dashStart.lessThanEqual(segmentStop)),
          () => {
            const newU = xOffset.sub(segmentStop);
            If(
              sqrt(newU.mul(newU).add(yOffset.mul(yOffset))).lessThan(
                halfWidth,
              ),
              () => {
                color.assign(blue);
              },
            ).Else(() => {
              Discard();
            });
          },
        );
      });

      // Incoming to start of closed curve
      // NOTE: In closed curves the nextFragment for the last segment
      // is the same as the endFragment for the first segment.
      If(dashStart.greaterThanEqual(freqPatternLength), () => {
        const u = dashPhase.mul(dashLength).mod(freqPatternLength);
        const v = texture(
          this.dashAtlas.atlas,
          vec2(u.div(freqPatternLength), 0),
        );
        const _start = v.z.mul(255).mul(dashLength);
        const _stop = v.a.mul(255).mul(dashLength);
        const firstSegmentDashStartDistance = max(u.negate().add(_start), 0);
        const firstSegmentDashStopDistance = u.negate().add(_stop);

        If(firstSegmentDashStopDistance.greaterThanEqual(0), () => {
          const firstSegmentStartFragment = varyingProperty(
            "vec2",
            "vFirstFragment",
          );
          const firstSegmentEndFragment = varyingProperty(
            "vec2",
            "vSecondFragment",
          );
          const firstSegmentStartToEnd = firstSegmentEndFragment.sub(
            firstSegmentStartFragment,
          );

          // TODO: distancePerFragment was calcuated based on the
          // 3D length of the current segment. This calculation
          // should use a new constant based on the 3D length of
          // the first segment.
          const firstSegmentDashStartFragment = firstSegmentStartFragment.add(
            firstSegmentStartToEnd
              .normalize()
              .mul(firstSegmentDashStartDistance)
              .mul(segmentFragmentsPerDistance),
          );
          const firstSegmentDashEndFragment = firstSegmentStartFragment.add(
            firstSegmentStartToEnd
              .normalize()
              .mul(firstSegmentDashStopDistance)
              .mul(segmentFragmentsPerDistance),
          );

          const fragmentHalfWidth = halfWidth.mul(segmentFragmentsPerDistance);
          const halfWidthSquared = fragmentHalfWidth.mul(fragmentHalfWidth);
          const segmentVec = firstSegmentDashEndFragment.sub(
            firstSegmentDashStartFragment,
          );
          const startToFrag = glFragCoord().sub(firstSegmentDashStartFragment);
          const endToFrag = glFragCoord().sub(firstSegmentDashEndFragment);
          const dotProduct = segmentVec.dot(startToFrag);
          const segmentProjection = startToFrag
            .dot(segmentVec)
            .div(segmentVec.dot(segmentVec))
            .mul(segmentVec);
          const segmentNormal = startToFrag.sub(segmentProjection);

          If(
            segmentCoversFragment(
              halfWidthSquared,
              segmentVec,
              startToFrag,
              endToFrag,
              dotProduct,
              segmentProjection,
              segmentNormal,
            ),
            () => {
              Discard();
            },
          );
        });
      });

      return vec4(strokeColor, strokeOpacity);
    });
  }
}

