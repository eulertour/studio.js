import {
  Discard,
  Fn,
  If,
  ShaderNodeObject,
  abs,
  add,
  attribute,
  div,
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
import DashAtlas from "../DashAtlas.js";

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

export default class FragmentShader {
  node: ShaderNodeFn<[]>;

  constructor(
    public dashAtlas: DashAtlas,
    color: UniformNode<THREE.Color>,
    opacity: UniformNode<number>,
    width: UniformNode<number>,
    strokeEnd: UniformNode<number>,
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

      const segmentStart = attribute("startLength");
      const segmentEnd = attribute("endLength");
      const segmentDistancePerFragment = segmentEnd
        .sub(segmentStart)
        .div(segmentVector.length());

      const offset = add(
        segmentStart,
        tangentVector
          .length()
          .mul(segmentDistancePerFragment)
          .mul(sign(dot(segmentVector, tangentVector))),
      );
      const referenceDashData = this.getReferenceDashData(
        offset,
        dashOffset,
        dashLength,
      );
      const referencePoint = referenceDashData.x;
      const referenceDashStart = referenceDashData.y;
      const referenceDashEnd = referenceDashData.z;
      const referencePointType = referenceDashData.w;

      const halfWidth = float(width).mul(UNITS_PER_STROKE_WIDTH / 2);
      const halfWidthSquared = mul(halfWidth, halfWidth);
      const dy = normalVector
        .length()
        .mul(segmentDistancePerFragment)
        .mul(sign(dot(rotate90(segmentVector), normalVector)));

      If(
        or(
          referenceDashEnd.lessThan(0),
          float(strokeEnd).lessThan(referenceDashStart),
        ),
        () => {
          Discard();
        },
      );

      // Stroke start
      If(
        offset
          .lessThanEqual(0)
          .and(referenceDashStart.lessThanEqual(0))
          .and(float(0).lessThanEqual(referenceDashEnd)),
        () => {
          const dx = float(0).sub(offset);
          If(lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared), () => {
            Discard();
          });
        },
      )
        // Stroke end
        .ElseIf(
          float(strokeEnd)
            .lessThanEqual(offset)
            .and(referenceDashStart.lessThanEqual(strokeEnd))
            .and(float(strokeEnd).lessThanEqual(referenceDashEnd)),
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
          const dx = max(offset.sub(referencePoint), 0);
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
          const dx = max(referencePoint.sub(offset), 0);
          If(lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared), () => {
            Discard();
          });
        });

      // Outgoing from join
      If(segmentStart.notEqual(0), () => {
        If(referenceDashStart.lessThanEqual(segmentStart), () => {
          If(offset.lessThanEqual(segmentStart), () => {
            Discard();
          });
          const previousFragment = varyingProperty("vec2", "vPreviousFragment");
          const startToPrevious = vec2(previousFragment.sub(startFragment));
          const previousSegmentDashStartDistance =
            segmentStart.sub(referenceDashStart);
          const previousSegmentFragmentsPerDistance = div(
            startToPrevious.length(),
            segmentStart.sub(attribute("prevLength")),
          );
          const previousSegmentDashStartFragment = startFragment.add(
            startToPrevious
              .normalize()
              .mul(previousSegmentDashStartDistance)
              .mul(previousSegmentFragmentsPerDistance),
          );
          If(
            segmentCoversFragment(
              glFragCoord(),
              previousSegmentDashStartFragment,
              startFragment,
              halfWidth.mul(previousSegmentFragmentsPerDistance),
            ),
            () => {
              Discard();
            },
          );
        });
      });

      // Incoming to join
      If(segmentEnd.notEqual(strokeEnd), () => {
        If(segmentEnd.lessThan(referenceDashStart), () => {
          Discard();
        });
        If(
          segmentEnd
            .lessThanEqual(offset)
            .and(referenceDashStart.lessThanEqual(segmentEnd))
            .and(segmentEnd.lessThanEqual(referenceDashEnd)),
          () => {
            const dx = offset.sub(segmentEnd);
            If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
              Discard();
            });
          },
        );
      });

      // Incoming to start of closed curve
      const patternLength = this.dashAtlas.period.mul(dashLength);
      If(float(strokeEnd).sub(offset).lessThanEqual(patternLength), () => {
        const startPointReferenceDashData = this.getReferenceDashData(
          0,
          dashOffset,
          dashLength,
        );

        const startPointReferenceDashStart = max(
          startPointReferenceDashData.y,
          0,
        );
        const startPointReferenceDashEnd = startPointReferenceDashData.z;

        If(startPointReferenceDashEnd.greaterThan(0), () => {
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
          const firstSegmentFragmentsPerDistance = div(
            firstSegmentStartToEnd.length(),
            varyingProperty("float", "vFirstSegmentLength"),
          );
          const firstSegmentDashStartFragment = firstSegmentStartFragment.add(
            firstSegmentStartToEnd
              .normalize()
              .mul(startPointReferenceDashStart)
              .mul(firstSegmentFragmentsPerDistance),
          );
          const firstSegmentDashEndFragment = firstSegmentStartFragment.add(
            firstSegmentStartToEnd
              .normalize()
              .mul(startPointReferenceDashEnd)
              .mul(firstSegmentFragmentsPerDistance),
          );

          If(
            segmentCoversFragment(
              glFragCoord(),
              firstSegmentDashStartFragment,
              firstSegmentDashEndFragment,
              halfWidth.mul(firstSegmentFragmentsPerDistance),
            ),
            () => {
              Discard();
            },
          );
        });
      });

      return vec4(color, opacity);
    });
  }

  getReferenceDashData = Fn(
    ([offset, dashOffset, dashLength]: [
      ShaderNodeObject<OperatorNode>,
      ShaderNodeObject<OperatorNode>,
      ShaderNodeObject<OperatorNode>,
    ]) => {
      const patternLength = this.dashAtlas.period.mul(dashLength);
      const patternOffset = offset.sub(dashOffset).mod(patternLength);

      const u = patternOffset.div(patternLength);
      const uStar = texture(this.dashAtlas.atlas, vec2(u, 0));

      const referencePointPatternOffset = uStar.x.mul(255).mul(dashLength);
      const referencePointType = uStar.y;
      const referenceDashStartPatternOffset = uStar.z.mul(255).mul(dashLength);
      const referenceDashEndPatternOffset = uStar.w.mul(255).mul(dashLength);

      const referencePoint = offset
        .sub(patternOffset)
        .add(referencePointPatternOffset);
      const referenceDashStart = offset
        .sub(patternOffset)
        .add(referenceDashStartPatternOffset);
      const referenceDashEnd = offset
        .sub(patternOffset)
        .add(referenceDashEndPatternOffset);

      return vec4(
        referencePoint,
        referenceDashStart,
        referenceDashEnd,
        referencePointType,
      );
    },
  );
}
