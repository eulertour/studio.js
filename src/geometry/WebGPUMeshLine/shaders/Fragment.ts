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
  min,
  mul,
  or,
  screenCoordinate,
  screenSize,
  select,
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
    startProportion: UniformNode<number>,
    endProportion: UniformNode<number>,
    arrow: UniformNode<number>,
  ) {
    this.node = Fn(() => {
      const isArrowSegment = varyingProperty("float", "vIsArrowSegment");
      If(isArrowSegment.and(float(arrow).not()), () => {
        Discard();
      });

      const startFragment = varyingProperty("vec2", "vStartFragment");
      const endFragment = varyingProperty("vec2", "vEndFragment");

      const segmentVector = endFragment.sub(startFragment);
      const fragmentVector = glFragCoord().sub(startFragment);
      const components = transformToBasis(fragmentVector, segmentVector);
      const tangentVector = components.xy;
      const normalVector = components.zw;

      const segmentStart = select(
        isArrowSegment,
        0,
        attribute("positionOffset").x,
      );
      const segmentEnd = select(
        isArrowSegment,
        varyingProperty("float", "vArrowSegmentLength"),
        attribute("positionOffset").y,
      );
      const segmentDistancePerFragment = segmentEnd
        .sub(segmentStart)
        .div(segmentVector.length());

      const offset = segmentStart.add(
        tangentVector
          .length()
          .mul(segmentDistancePerFragment)
          .mul(sign(dot(segmentVector, tangentVector))),
      );

      const strokeOrArrowEnd = select(
        isArrowSegment,
        varyingProperty("float", "vArrowSegmentLength"),
        strokeEnd,
      );
      const referenceDashData = select(
        float(dashLength).equal(0),
        vec4(0, 0, strokeOrArrowEnd, 0),
        this.getReferenceDashData(offset, dashOffset, dashLength),
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
          float(strokeOrArrowEnd).lessThan(referenceDashStart),
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
          float(strokeOrArrowEnd)
            .lessThanEqual(offset)
            .and(referenceDashStart.lessThanEqual(strokeOrArrowEnd))
            .and(float(strokeOrArrowEnd).lessThanEqual(referenceDashEnd)),
          () => {
            const dx = offset.sub(strokeOrArrowEnd);
            If(
              lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared),
              () => {
                Discard();
              },
            );
          },
        );

      // NOTE: The start, body, and end dash types are represented
      // in the DataTexture as +1, 0, and -1, respectively. These
      // values become 1/255, 0, and 1 when read in the fragment shader.
      //
      // Dash end
      If(referencePointType.equal(1), () => {
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
          const previousSegmentStart = attribute("positionOffset").z;
          const previousSegmentFragmentsPerDistance = div(
            startToPrevious.length(),
            segmentStart.sub(previousSegmentStart),
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
      If(segmentEnd.notEqual(strokeOrArrowEnd), () => {
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
      const drawStart = float(strokeOrArrowEnd).mul(startProportion);
      const drawEnd = float(strokeOrArrowEnd).mul(endProportion);
      const isFirstSegment = segmentStart.equal(0);
      If(
        or(
          float(dashLength)
            .notEqual(0)
            .and(
              float(strokeOrArrowEnd).sub(offset).lessThanEqual(patternLength),
            ),
          float(dashLength).equal(0).and(isFirstSegment.not()),
        ),
        () => {
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

          const firstSegmentLength = varyingProperty(
            "float",
            "vFirstSegmentLength",
          );
          const firstSegmentFragmentsPerDistance = div(
            firstSegmentStartToEnd.length(),
            firstSegmentLength,
          );

          If(float(dashLength).equal(0), () => {
            If(drawStart.lessThanEqual(firstSegmentLength), () => {
              const firstSegmentDrawStartFragment =
                firstSegmentStartFragment.add(
                  firstSegmentStartToEnd
                    .normalize()
                    .mul(drawStart)
                    .mul(firstSegmentFragmentsPerDistance),
                );
              const firstSegmentDrawEndFragment = firstSegmentStartFragment.add(
                firstSegmentStartToEnd
                  .normalize()
                  .mul(min(drawEnd, firstSegmentLength))
                  .mul(firstSegmentFragmentsPerDistance),
              );
              If(
                segmentCoversFragment(
                  glFragCoord(),
                  firstSegmentDrawStartFragment,
                  firstSegmentDrawEndFragment,
                  halfWidth.mul(firstSegmentFragmentsPerDistance),
                ),
                () => {
                  Discard();
                },
              );
            });
          }).ElseIf(startPointReferenceDashEnd.greaterThan(0), () => {
            const firstSegmentDashStartFragment = firstSegmentStartFragment.add(
              firstSegmentStartToEnd
                .normalize()
                .mul(max(drawStart, startPointReferenceDashStart))
                .mul(firstSegmentFragmentsPerDistance),
            );
            const firstSegmentDashEndFragment = firstSegmentStartFragment.add(
              firstSegmentStartToEnd
                .normalize()
                .mul(max(drawStart, startPointReferenceDashEnd))
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
        },
      );

      // End of draw range
      If(float(dashLength).equal(0), () => {
        If(drawEnd.lessThanEqual(offset), () => {
          const dx = offset.sub(drawEnd);
          If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
            Discard();
          });
        });
      }).Else(() => {
        If(drawEnd.lessThanEqual(referenceDashStart), () => {
          Discard();
        }).ElseIf(drawEnd.lessThanEqual(offset), () => {
          const dx = offset.sub(drawEnd);
          If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
            Discard();
          });
        });
      });

      // Start of draw range
      // const testColor = vec4(color, opacity).toVar();
      If(float(dashLength).equal(0), () => {
        If(segmentEnd.lessThanEqual(drawStart), () => {
          const nextFragment = varyingProperty("vec2", "vNextFragment");
          const endToNext = vec2(nextFragment.sub(endFragment));
          const nextSegmentStartPointDistance = drawStart.sub(segmentEnd);
          const nextSegmentEnd = attribute("positionOffset").w;
          const nextSegmentFragmentsPerDistance = div(
            endToNext.length(),
            nextSegmentEnd.sub(segmentEnd),
          );
          const nextSegmentStartPointFragment = endFragment.add(
            endToNext
              .normalize()
              .mul(nextSegmentStartPointDistance)
              .mul(nextSegmentFragmentsPerDistance),
          );
          If(
            segmentCoversFragment(
              glFragCoord(),
              nextSegmentStartPointFragment,
              nextFragment,
              halfWidth.mul(nextSegmentFragmentsPerDistance),
            ).not(),
            () => {
              Discard();
            },
          );
          // Discard();
        }).ElseIf(
          segmentStart
            .lessThanEqual(drawStart)
            .and(drawStart.lessThanEqual(segmentEnd)),
          () => {
            If(offset.lessThanEqual(drawStart), () => {
              const dx = drawStart.sub(offset);
              If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
                const nextFragment = varyingProperty("vec2", "vNextFragment");
                const endToNext = vec2(nextFragment.sub(endFragment));
                const nextSegmentStartPointDistance = drawStart.sub(segmentEnd);
                const nextSegmentEnd = attribute("positionOffset").w;
                const nextSegmentFragmentsPerDistance = div(
                  endToNext.length(),
                  nextSegmentEnd.sub(segmentEnd),
                );
                const nextSegmentStartPointFragment = endFragment.add(
                  endToNext
                    .normalize()
                    .mul(nextSegmentStartPointDistance)
                    .mul(nextSegmentFragmentsPerDistance),
                );
                If(
                  segmentCoversFragment(
                    glFragCoord(),
                    nextSegmentStartPointFragment,
                    nextFragment,
                    halfWidth.mul(nextSegmentFragmentsPerDistance),
                  ).not(),
                  () => {
                    Discard();
                  },
                );
              });
            });
          },
        );
      }).Else(() => {
        If(segmentEnd.lessThanEqual(drawStart), () => {
          If(referenceDashEnd.lessThanEqual(drawStart), () => {
            Discard();
          }).ElseIf(
            referenceDashStart
              .lessThanEqual(drawStart)
              .and(drawStart.lessThanEqual(referenceDashEnd)),
            () => {
              const nextFragment = varyingProperty("vec2", "vNextFragment");
              const endToNext = vec2(nextFragment.sub(endFragment));
              const nextSegmentStartPointDistance = drawStart.sub(segmentEnd);
              const nextSegmentEnd = attribute("positionOffset").w;
              const nextSegmentFragmentsPerDistance = div(
                endToNext.length(),
                nextSegmentEnd.sub(segmentEnd),
              );
              const nextSegmentStartPointFragment = endFragment.add(
                endToNext
                  .normalize()
                  .mul(nextSegmentStartPointDistance)
                  .mul(nextSegmentFragmentsPerDistance),
              );
              If(
                segmentCoversFragment(
                  glFragCoord(),
                  nextSegmentStartPointFragment,
                  nextFragment,
                  halfWidth.mul(nextSegmentFragmentsPerDistance),
                ).not(),
                () => {
                  Discard();
                },
              );
            },
          );
          // .Else(/* drawStart.lessThanEqual(referenceDashStart) */ () => {
          //   // No dash pattern will cause this fragment
          //   // to be discarded.
          // });
        }).ElseIf(
          segmentStart
            .lessThanEqual(drawStart)
            .and(drawStart.lessThanEqual(segmentEnd)),
          () => {
            If(referenceDashEnd.lessThanEqual(drawStart), () => {
              Discard();
            }).ElseIf(
              referenceDashStart
                .lessThanEqual(drawStart)
                .and(drawStart.lessThanEqual(referenceDashEnd)),
              () => {
                If(offset.lessThanEqual(drawStart), () => {
                  const dx = offset.distance(drawStart);
                  If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
                    Discard();
                  });
                });
              },
            );
            // .Else(/* drawStart.lessThanEqual(referenceDashStart) */ () => {
            //   // No dash pattern will cause this fragment
            //   // to be discarded.
            // });
          },
        );
        // .Else(/* drawStart.lessThanEqual(segmentStart)*/ () => {
        //   // No dash pattern will cause this fragment
        //   // to be discarded.
        // });
      });

      // const red = vec4(1, 0, 0, 1);
      // const green = vec4(0, 1, 0, 1);
      // const blue = vec4(0, 0, 1, 1);
      // const purple = vec4(1, 0, 1, 1);
      // // Arrows
      // const testHalfWidth = float(4)
      //   .mul(1 / 20)
      //   .mul(1 / 2);
      // const dx = offset
      //   .mul(segmentDistancePerFragment)
      //   .mul(sign(dot(rotate90(segmentVector), normalVector)));
      // If(
      //   float(offset)
      //     .and(normalVector.x.abs().greaterThan(testHalfWidth))
      //     .and(normalVector.y.equal(0)),
      //   () => {
      //     testColor.assign(varyingProperty("vec4", "vTestColor"));
      //   },
      // );

      // return testColor;
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
