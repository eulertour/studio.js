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
  vec3,
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
      const components = transformToBasis(fragmentVector, segmentVector);
      const tangentVector = components.xy;
      const normalVector = components.zw;

      const startLength = attribute("startLength");
      const endLength = attribute("endLength");
      const segmentDistancePerFragment = endLength
        .sub(startLength)
        .div(segmentVector.length());
      const segmentFragmentsPerDistance = float(1).div(
        segmentDistancePerFragment,
      );

      const offset = add(
        startLength,
        tangentVector
          .length()
          .mul(segmentDistancePerFragment)
          .mul(sign(dot(segmentVector, tangentVector))),
      );
      const patternLength = this.dashAtlas.period.mul(dashLength);
      const referenceDashData = this.getReferenceDashData(
        offset,
        dashOffset,
        dashLength,
      );
      const referencePointOffset = referenceDashData.x;
      const referenceDashStartOffset = referenceDashData.y;
      const referenceDashEndOffset = referenceDashData.z;
      const referencePointType = referenceDashData.w;

      const strokeEnd = float(strokeLength);
      const segmentStart = startLength;
      const segmentEnd = endLength;
      const halfWidth = float(strokeWidth).mul(UNITS_PER_STROKE_WIDTH / 2);
      const halfWidthSquared = mul(halfWidth, halfWidth);
      const dy = normalVector
        .length()
        .mul(segmentDistancePerFragment)
        .mul(sign(dot(rotate90(segmentVector), normalVector)));

      If(
        or(
          referenceDashEndOffset.lessThan(0),
          strokeEnd.lessThan(referenceDashStartOffset),
        ),
        () => {
          Discard();
        },
      );

      // Stroke start
      If(
        offset
          .lessThanEqual(0)
          .and(referenceDashStartOffset.lessThanEqual(0))
          .and(float(0).lessThanEqual(referenceDashEndOffset)),
        () => {
          const dx = float(0).sub(offset);
          If(lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared), () => {
            Discard();
          });
        },
      )
        // Stroke end
        .ElseIf(
          strokeEnd
            .lessThanEqual(offset)
            .and(referenceDashStartOffset.lessThanEqual(strokeEnd))
            .and(strokeEnd.lessThanEqual(referenceDashEndOffset)),
          () => {
            const dx = offset.sub(strokeEnd);
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
          const dx = max(offset.sub(referencePointOffset), 0);
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
          const dx = max(referencePointOffset.sub(offset), 0);
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
      If(segmentStart.notEqual(0), () => {
        If(referenceDashStartOffset.lessThanEqual(segmentStart), () => {
          If(offset.lessThanEqual(segmentStart), () => {
            Discard();
          });
          const previousFragment = varyingProperty("vec2", "vPreviousFragment");
          const startToPrevious = vec2(previousFragment.sub(startFragment));
          const previousSegmentDashStartDistance = segmentStart.sub(
            referenceDashStartOffset,
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
      If(segmentEnd.notEqual(strokeEnd), () => {
        If(segmentEnd.lessThan(referenceDashStartOffset), () => {
          Discard();
        });
        If(
          segmentEnd
            .lessThanEqual(offset)
            .and(referenceDashStartOffset.lessThanEqual(segmentEnd))
            .and(segmentEnd.lessThanEqual(referenceDashEndOffset)),
          () => {
            const dx = offset.sub(segmentEnd);
            If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
              Discard();
            });
          },
        );
      });

      // Incoming to start of closed curve
      If(float(strokeLength).sub(offset).lessThanEqual(patternLength), () => {
        const startPointReferenceDashData = this.getReferenceDashData(
          0,
          dashOffset,
          dashLength,
        );

        const startPointReferenceDashStartOffset = max(
          startPointReferenceDashData.y,
          0,
        );
        const startPointReferenceDashEndOffset = startPointReferenceDashData.z;

        If(startPointReferenceDashEndOffset.greaterThan(0), () => {
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
              .mul(startPointReferenceDashStartOffset)
              .mul(segmentFragmentsPerDistance),
          );
          const firstSegmentDashEndFragment = firstSegmentStartFragment.add(
            firstSegmentStartToEnd
              .normalize()
              .mul(startPointReferenceDashEndOffset)
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

  getReferenceDashData = Fn(
    ([strokeOffset, dashOffset, dashLength]: [
      ShaderNodeObject<OperatorNode>,
      ShaderNodeObject<OperatorNode>,
      ShaderNodeObject<OperatorNode>,
    ]) => {
      const patternLength = this.dashAtlas.period.mul(dashLength);
      const patternOffset = strokeOffset.sub(dashOffset).mod(patternLength);

      const u = patternOffset.div(patternLength);
      const uStar = texture(this.dashAtlas.atlas, vec2(u, 0));

      const referencePointPatternOffset = uStar.x.mul(255).mul(dashLength);
      const referencePointType = uStar.y;
      const referenceDashStartPatternOffset = uStar.z.mul(255).mul(dashLength);
      const referenceDashEndPatternOffset = uStar.w.mul(255).mul(dashLength);

      const referencePointOffset = strokeOffset
        .sub(patternOffset)
        .add(referencePointPatternOffset);
      const referenceDashStartOffset = strokeOffset
        .sub(patternOffset)
        .add(referenceDashStartPatternOffset);
      const referenceDashEndOffset = strokeOffset
        .sub(patternOffset)
        .add(referenceDashEndPatternOffset);

      return vec4(
        referencePointOffset,
        referenceDashStartOffset,
        referenceDashEndOffset,
        referencePointType,
      );
    },
  );
}
