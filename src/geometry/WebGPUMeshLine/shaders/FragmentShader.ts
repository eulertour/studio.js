import {
  Discard,
  Fn,
  If,
  ShaderNodeObject,
  abs,
  add,
  attribute,
  dot,
  float,
  max,
  mul,
  or,
  screenCoordinate,
  screenSize,
  sign,
  texture,
  varyingProperty,
  vec2,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";
import OperatorNode from "three/src/nodes/math/OperatorNode.js";
import { ShaderNodeFn } from "three/src/nodes/TSL.js";
import { UniformNode } from "three/webgpu";
import { UNITS_PER_STROKE_WIDTH } from "../../../constants.js";
import DashAtlas from "./DashAtlas.js";

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

const segmentCoversFragment2 = Fn(
  ([fragment, start, end, halfWidth]: [
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
  ]) => {
    const startToFrag = fragment.sub(start);
    const endToFrag = fragment.sub(end);
    const startToEnd = end.sub(start);
    const halfWidthSquared = mul(halfWidth, halfWidth);

    const coveredByStart =
      lengthSquared(startToFrag).lessThanEqual(halfWidthSquared);
    const coveredByEnd =
      lengthSquared(endToFrag).lessThanEqual(halfWidthSquared);

    const basis = transformToBasis(startToFrag, startToEnd);
    const tangent = basis.xy;
    const normal = basis.zw;

    const coveredByStem = dot(tangent, startToEnd)
      .greaterThanEqual(0)
      .and(lengthSquared(tangent).lessThanEqual(lengthSquared(startToEnd)))
      .and(lengthSquared(normal).lessThanEqual(halfWidthSquared));

    return coveredByStem.or(coveredByStart).or(coveredByEnd);
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
    strokeColor: UniformNode<THREE.Color>,
    strokeOpacity: UniformNode<number>,
    strokeWidth: UniformNode<number>,
    strokeLength: UniformNode<number>,
    dashLength: UniformNode<number>,
    dashOffset: UniformNode<number>,
  ) {
    this.node = Fn(() => {
      const startFragment = varyingProperty("vec2", "vStartFragment");
      const endFragment = varyingProperty("vec2", "vEndFragment");

      const segmentVector = endFragment.sub(startFragment);
      const fragmentVector = glFragCoord().sub(startFragment);
      const basis = transformToBasis(fragmentVector, segmentVector);
      const tangentVector = basis.xy;
      const normalVector = basis.zw;

      const startLength = float(strokeLength).mul(attribute("startProportion"));
      const endLength = float(strokeLength).mul(attribute("endProportion"));
      const segmentDistancePerFragment = endLength
        .sub(startLength)
        .div(segmentVector.length());
      const segmentFragmentsPerDistance = float(1).div(
        segmentDistancePerFragment,
      );

      const strokeOffset = add(
        startLength,
        tangentVector
          .length()
          .mul(segmentDistancePerFragment)
          .mul(sign(dot(segmentVector, tangentVector))),
      );

      const patternLength = this.dashAtlas.period.mul(dashLength);
      const patternOffset = strokeOffset.sub(dashOffset).mod(patternLength);

      const u = patternOffset.div(patternLength);
      const uStar = texture(this.dashAtlas.atlas, vec2(u, 0));

      const referencePointPatternOffset = uStar.x.mul(255).mul(dashLength);
      const referencePointType = uStar.y;
      const referenceDashStartPatternOffset = uStar.z.mul(255).mul(dashLength);
      const referenceDashStopPatternOffset = uStar.w.mul(255).mul(dashLength);

      const referenceDashStartStrokeOffset = strokeOffset
        .sub(patternOffset)
        .add(referenceDashStartPatternOffset);
      const referenceDashStopStrokeOffset = strokeOffset
        .sub(patternOffset)
        .add(referenceDashStopPatternOffset);

      const strokeStart = float(0);
      const strokeEnd = float(strokeLength);
      const segmentStart = startLength;
      const segmentStop = endLength;
      const halfWidth = float(strokeWidth).mul(UNITS_PER_STROKE_WIDTH / 2);
      const halfWidthSquared = mul(halfWidth, halfWidth);
      const dy = normalVector
        .length()
        .mul(segmentDistancePerFragment)
        .mul(sign(dot(rotate90(segmentVector), normalVector)));

      If(
        or(
          referenceDashStopStrokeOffset.lessThan(strokeStart),
          referenceDashStartStrokeOffset.greaterThan(strokeEnd),
        ),
        () => {
          Discard();
        },
      );

      // Stroke start
      If(
        strokeOffset
          .lessThanEqual(strokeStart)
          .and(referenceDashStartStrokeOffset.lessThanEqual(strokeStart))
          .and(strokeStart.lessThanEqual(referenceDashStopStrokeOffset)),
        () => {
          const dx = strokeStart.sub(strokeOffset);
          If(lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared), () => {
            Discard();
          });
        },
      )
        // Stroke end
        .ElseIf(
          strokeEnd
            .lessThanEqual(strokeOffset)
            .and(referenceDashStartStrokeOffset.lessThanEqual(strokeEnd))
            .and(strokeEnd.lessThanEqual(referenceDashStopStrokeOffset)),
          () => {
            const dx = strokeOffset.sub(strokeEnd);
            If(
              lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared),
              () => {
                Discard();
              },
            );
          },
        )
        // NOTE: The start, body, and end dash types are represented
        // in the DataTexture as +1, 0, and -1, respectively. These
        // values become 1/255, 0, and 1 when read in the fragment shader.
        //
        // Dash end
        .ElseIf(referencePointType.equal(1), () => {
          const dx = max(patternOffset.sub(referencePointPatternOffset), 0);
          If(lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared), () => {
            Discard();
          });
        })
        // Dash body
        .ElseIf(referencePointType.equal(0), () => {
          If(abs(dy).greaterThanEqual(halfWidth), () => {
            Discard();
          });
        })
        // Dash start
        .ElseIf(referencePointType.greaterThan(0), () => {
          const dx = max(referencePointPatternOffset.sub(patternOffset), 0);
          If(lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared), () => {
            Discard();
          });
        });

      // TODO: The conversion factor between fragments and distance
      // was calculated based on the 3D length of the current
      // segment. Conversions for other segments should be based on
      // the 3D lengths of the those segments.
      //
      // Outgoing from join
      If(segmentStart.notEqual(strokeStart), () => {
        If(referenceDashStartStrokeOffset.lessThanEqual(segmentStart), () => {
          If(strokeOffset.lessThanEqual(segmentStart), () => {
            Discard();
          });
          const previousFragment = varyingProperty("vec2", "vPreviousFragment");
          const startToPrevious = vec2(previousFragment.sub(startFragment));
          const previousSegmentDashStartDistance = segmentStart.sub(
            referenceDashStartStrokeOffset,
          );
          const previousSegmentDashStartFragment = startFragment.add(
            startToPrevious
              .normalize()
              .mul(previousSegmentDashStartDistance)
              .mul(segmentFragmentsPerDistance),
          );
          If(
            segmentCoversFragment2(
              glFragCoord(),
              previousSegmentDashStartFragment,
              startFragment,
              halfWidth.mul(segmentFragmentsPerDistance),
            ),
            () => {
              Discard();
            },
          );
        });
      });

      // Incoming to join
      If(segmentStop.notEqual(strokeEnd), () => {
        If(segmentStop.lessThan(referenceDashStartStrokeOffset), () => {
          Discard();
        });
        If(
          segmentStop
            .lessThanEqual(strokeOffset)
            .and(referenceDashStartStrokeOffset.lessThanEqual(segmentStop))
            .and(segmentStop.lessThanEqual(referenceDashStopStrokeOffset)),
          () => {
            const dx = strokeOffset.sub(segmentStop);
            If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
              Discard();
            });
          },
        );
      });

      // Incoming to start of closed curve
      If(referenceDashStartStrokeOffset.greaterThanEqual(patternLength), () => {
        const u = float(dashOffset).negate().mod(patternLength);
        const v = texture(this.dashAtlas.atlas, vec2(u.div(patternLength), 0));
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
