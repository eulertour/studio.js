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
  or,
  screenCoordinate,
  screenSize,
  sign,
  sqrt,
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

      If(
        or(
          referenceDashStopStrokeOffset.lessThan(strokeStart),
          referenceDashStartStrokeOffset.greaterThan(strokeEnd),
        ),
        () => {
          Discard();
        },
      );

      const dy = normalVector
        .length()
        .mul(segmentDistancePerFragment)
        .mul(sign(dot(rotate90(segmentVector), normalVector)));
      // Stroke start
      If(
        strokeOffset
          .lessThanEqual(strokeStart)
          .and(referenceDashStartStrokeOffset.lessThanEqual(strokeStart))
          .and(strokeStart.lessThanEqual(referenceDashStopStrokeOffset)),
        () => {
          const dx = strokeStart.sub(strokeOffset);
          If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
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
            If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
              Discard();
            });
          },
        )
        // NOTE: The start, body, and end dash types are represented
        // in the DataTexture as +1, 0, and -1, respectively. These
        // values become 1/255, 0, and 1 when read in the fragment shader.
        //
        // Dash end
        .ElseIf(referencePointType.equal(1), () => {
          const dx = max(patternOffset.sub(referencePointPatternOffset), 0);
          If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
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
          If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
            Discard();
          });
        });

      // Outgoing from join
      If(segmentStart.notEqual(strokeStart), () => {
        If(referenceDashStartStrokeOffset.lessThanEqual(segmentStart), () => {
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
          If(strokeOffset.lessThanEqual(segmentStart), () => {
            Discard();
          });
        });
      });

      // Incoming to join
      If(segmentStop.notEqual(strokeEnd), () => {
        If(referenceDashStartStrokeOffset.greaterThan(segmentStop), () => {
          Discard();
        });
        If(
          strokeOffset
            .greaterThanEqual(segmentStop)
            .and(referenceDashStopStrokeOffset.greaterThanEqual(segmentStop))
            .and(referenceDashStartStrokeOffset.lessThanEqual(segmentStop)),
          () => {
            const newU = strokeOffset.sub(segmentStop);
            If(
              sqrt(newU.mul(newU).add(dy.mul(dy))).greaterThan(halfWidth),
              () => {
                Discard();
              },
            );
          },
        );
      });

      // Incoming to start of closed curve
      // NOTE: In closed curves the nextFragment for the last segment
      // is the same as the endFragment for the first segment.
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
