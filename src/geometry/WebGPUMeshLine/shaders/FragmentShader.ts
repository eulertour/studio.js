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

// This returns [cssViewportWidth, cssViewportHeight] * devicePixelRatio.
// If the css dimensions are 1280x720, this returns
// [1280, 720] * devicePixelRatio, which may be [1408, 792].
const glFragCoord = Fn(() =>
  vec2(screenCoordinate.x, screenSize.y.sub(screenCoordinate.y)),
);

const rotate90 = Fn(([vector]: [ShaderNodeObject<OperatorNode>]) =>
  vec2(vector.y.negate(), vector.x),
);

const lengthSquared = Fn(([vector]: [ShaderNodeObject<OperatorNode>]) =>
  dot(vector, vector),
);

const projectOntoVector = Fn(
  ([vectorToProject, vectorToProjectOnto]: [
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
  ]) => {
    const projectionUnitVector = vectorToProjectOnto.normalize();
    return vectorToProject.dot(projectionUnitVector).mul(projectionUnitVector);
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

const segmentCoversFragment = Fn(
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
          If(abs(dy).greaterThan(halfWidth), () => {
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
            segmentCoversFragment(
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
        const startPointPatternOffset = float(dashOffset)
          .negate()
          .mod(patternLength);

        const u0 = startPointPatternOffset.div(patternLength);
        const uStar0 = texture(this.dashAtlas.atlas, vec2(u0, 0));

        const firstDashStartPatternOffset = uStar0.z.mul(255).mul(dashLength);
        const firstDashStopPatternOffset = uStar0.w.mul(255).mul(dashLength);

        const firstDashStartStrokeOffset = max(
          startPointPatternOffset.negate().add(firstDashStartPatternOffset),
          0,
        );
        const firstDashStopStrokeOffset = startPointPatternOffset
          .negate()
          .add(firstDashStopPatternOffset);

        If(firstDashStopStrokeOffset.greaterThanEqual(0), () => {
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
              .mul(firstDashStartStrokeOffset)
              .mul(segmentFragmentsPerDistance),
          );
          const firstSegmentDashEndFragment = firstSegmentStartFragment.add(
            firstSegmentStartToEnd
              .normalize()
              .mul(firstDashStopStrokeOffset)
              .mul(segmentFragmentsPerDistance),
          );

          If(
            segmentCoversFragment(
              glFragCoord(),
              firstSegmentDashStartFragment,
              firstSegmentDashEndFragment,
              halfWidth.mul(segmentFragmentsPerDistance),
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
