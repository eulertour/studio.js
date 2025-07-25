import { Discard, Fn, If, abs, attribute, add, sub, div, dot, float, max, min, mul, or, reciprocal, screenCoordinate, screenSize, select, sign, texture, varyingProperty, vec2, vec4, } from "three/tsl";
import { UNITS_PER_STROKE_WIDTH } from "../../../constants.js";
// This returns [cssViewportWidth, cssViewportHeight] * devicePixelRatio.
// If the css dimensions are 1280x720, this returns
// [1280, 720] * devicePixelRatio, which may be [1408, 792].
const glFragCoord = Fn(([viewport, viewportSize, devicePixelRatio, viewportOffset]) => {
    const viewportSet = viewport.z.greaterThan(0).or(viewport.w.greaterThan(0));
    const screenTopToViewportBottom = mul(add(viewportOffset.y, viewportSize.y), devicePixelRatio);
    const viewportBottomToCoord = sub(screenTopToViewportBottom, screenCoordinate.y);
    return select(viewportSet, vec2(screenCoordinate.x, viewportBottomToCoord), vec2(screenCoordinate.x, screenSize.y.sub(screenCoordinate.y)));
});
const rotate90 = Fn(([vector]) => vec2(vector.y.negate(), vector.x));
const lengthSquared = Fn(([vector]) => dot(vector, vector));
const projectOntoVector = Fn(([vectorToProject, vectorToProjectOnto]) => {
    const projectionUnitVector = vectorToProjectOnto.normalize();
    return vectorToProject.dot(projectionUnitVector).mul(projectionUnitVector);
});
const transformToBasis = Fn(([input, basis]) => {
    const tangent = projectOntoVector(input, basis);
    const normal = input.sub(tangent);
    return vec4(tangent, normal);
});
const segmentCoversFragment = Fn(([fragment, start, end, halfWidth]) => {
    const startToFrag = fragment.sub(start);
    const endToFrag = fragment.sub(end);
    const startToEnd = end.sub(start);
    const halfWidthSquared = mul(halfWidth, halfWidth);
    const coveredByStart = lengthSquared(startToFrag).lessThanEqual(halfWidthSquared);
    const coveredByEnd = lengthSquared(endToFrag).lessThanEqual(halfWidthSquared);
    const basis = transformToBasis(startToFrag, startToEnd);
    const tangent = basis.xy;
    const normal = basis.zw;
    const coveredByStem = dot(tangent, startToEnd)
        .greaterThanEqual(0)
        .and(lengthSquared(tangent).lessThanEqual(lengthSquared(startToEnd)))
        .and(lengthSquared(normal).lessThanEqual(halfWidthSquared));
    return coveredByStem.or(coveredByStart).or(coveredByEnd);
});
export default class FragmentShader {
    constructor(dashAtlas, color, opacity, width, strokeEnd, dashLength, dashOffset, startProportion, endProportion, arrow, drawArrow, viewport, viewportSize, viewportOffset, devicePixelRatio) {
        Object.defineProperty(this, "dashAtlas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dashAtlas
        });
        Object.defineProperty(this, "node", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "getReferenceDashData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Fn(([offset, dashOffset, dashLength]) => {
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
                return vec4(referencePoint, referenceDashStart, referenceDashEnd, referencePointType);
            })
        });
        this.node = Fn(() => {
            const isArrowSegment = varyingProperty("float", "vIsArrowSegment");
            If(isArrowSegment.and(float(arrow).not()), () => {
                Discard();
            });
            const startFragment = varyingProperty("vec2", "vStartFragment");
            const endFragment = varyingProperty("vec2", "vEndFragment");
            const segmentVector = endFragment.sub(startFragment);
            const fragmentVector = glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset).sub(startFragment);
            const components = transformToBasis(fragmentVector, segmentVector);
            const tangentVector = components.xy;
            const normalVector = components.zw;
            const segmentStart = select(isArrowSegment, 0, attribute("positionOffset").x);
            const segmentEnd = select(isArrowSegment, varyingProperty("float", "vArrowSegmentLength"), attribute("positionOffset").y);
            const segmentDistancePerFragment = segmentEnd
                .sub(segmentStart)
                .div(segmentVector.length());
            const offset = segmentStart.add(tangentVector
                .length()
                .mul(segmentDistancePerFragment)
                .mul(sign(dot(segmentVector, tangentVector))));
            const strokeOrArrowEnd = select(isArrowSegment, varyingProperty("float", "vArrowSegmentLength"), strokeEnd);
            const referenceDashData = select(float(dashLength).equal(0).or(isArrowSegment), vec4(0, 0, strokeOrArrowEnd, 0), this.getReferenceDashData(offset, dashOffset, dashLength));
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
            If(or(referenceDashEnd.lessThan(0), float(strokeOrArrowEnd).lessThan(referenceDashStart)), () => {
                Discard();
            });
            // Stroke start
            If(offset
                .lessThanEqual(0)
                .and(referenceDashStart.lessThanEqual(0))
                .and(float(0).lessThanEqual(referenceDashEnd)), () => {
                const dx = float(0).sub(offset);
                If(lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared), () => {
                    Discard();
                });
            })
                // Stroke end
                .ElseIf(float(strokeOrArrowEnd)
                .lessThanEqual(offset)
                .and(referenceDashStart.lessThanEqual(strokeOrArrowEnd))
                .and(float(strokeOrArrowEnd).lessThanEqual(referenceDashEnd)), () => {
                const dx = offset.sub(strokeOrArrowEnd);
                If(lengthSquared(vec2(dx, dy)).greaterThan(halfWidthSquared), () => {
                    Discard();
                });
            });
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
                    const previousSegmentDashStartDistance = segmentStart.sub(referenceDashStart);
                    const previousSegmentStart = attribute("positionOffset").z;
                    const previousSegmentFragmentsPerDistance = div(startToPrevious.length(), segmentStart.sub(previousSegmentStart));
                    const previousSegmentDashStartFragment = startFragment.add(startToPrevious
                        .normalize()
                        .mul(previousSegmentDashStartDistance)
                        .mul(previousSegmentFragmentsPerDistance));
                    If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), previousSegmentDashStartFragment, startFragment, halfWidth.mul(previousSegmentFragmentsPerDistance)), () => {
                        Discard();
                    });
                });
            });
            // Incoming to join
            If(segmentEnd.notEqual(strokeOrArrowEnd), () => {
                If(segmentEnd.lessThan(referenceDashStart), () => {
                    Discard();
                });
                If(segmentEnd
                    .lessThanEqual(offset)
                    .and(referenceDashStart.lessThanEqual(segmentEnd))
                    .and(segmentEnd.lessThanEqual(referenceDashEnd)), () => {
                    const dx = offset.sub(segmentEnd);
                    If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
                        Discard();
                    });
                });
            });
            // Incoming to start of closed curve
            const patternLength = this.dashAtlas.period.mul(dashLength);
            const skipDrawingArrow = isArrowSegment.and(float(drawArrow).equal(0));
            const drawStart = select(skipDrawingArrow, 0, float(strokeOrArrowEnd).mul(startProportion));
            const drawEnd = select(skipDrawingArrow, strokeOrArrowEnd, float(strokeOrArrowEnd).mul(endProportion));
            const isFirstSegment = segmentStart.equal(0);
            If(or(float(dashLength)
                .notEqual(0)
                .and(float(strokeOrArrowEnd).sub(offset).lessThanEqual(patternLength))
                .and(float(arrow).equal(0)), float(dashLength).equal(0).and(isFirstSegment.not())), () => {
                const startPointReferenceDashData = this.getReferenceDashData(0, dashOffset, dashLength);
                const startPointReferenceDashStart = max(startPointReferenceDashData.y, 0);
                const startPointReferenceDashEnd = startPointReferenceDashData.z;
                const firstSegmentStartFragment = varyingProperty("vec2", "vFirstFragment");
                const firstSegmentEndFragment = varyingProperty("vec2", "vSecondFragment");
                const firstSegmentStartToEnd = firstSegmentEndFragment.sub(firstSegmentStartFragment);
                const firstSegmentLength = varyingProperty("float", "vFirstSegmentLength");
                const firstSegmentFragmentsPerDistance = div(firstSegmentStartToEnd.length(), firstSegmentLength);
                If(float(dashLength).equal(0), () => {
                    If(drawStart.lessThanEqual(firstSegmentLength), () => {
                        const firstSegmentDrawStartFragment = firstSegmentStartFragment.add(firstSegmentStartToEnd
                            .normalize()
                            .mul(drawStart)
                            .mul(firstSegmentFragmentsPerDistance));
                        const firstSegmentDrawEndFragment = firstSegmentStartFragment.add(firstSegmentStartToEnd
                            .normalize()
                            .mul(min(drawEnd, firstSegmentLength))
                            .mul(firstSegmentFragmentsPerDistance));
                        If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), firstSegmentDrawStartFragment, firstSegmentDrawEndFragment, halfWidth.mul(firstSegmentFragmentsPerDistance)), () => {
                            Discard();
                        });
                    });
                }).ElseIf(startPointReferenceDashEnd.greaterThan(0), () => {
                    const firstSegmentDashStartFragment = firstSegmentStartFragment.add(firstSegmentStartToEnd
                        .normalize()
                        .mul(max(drawStart, startPointReferenceDashStart))
                        .mul(firstSegmentFragmentsPerDistance));
                    const firstSegmentDashEndFragment = firstSegmentStartFragment.add(firstSegmentStartToEnd
                        .normalize()
                        .mul(max(drawStart, startPointReferenceDashEnd))
                        .mul(firstSegmentFragmentsPerDistance));
                    If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), firstSegmentDashStartFragment, firstSegmentDashEndFragment, halfWidth.mul(firstSegmentFragmentsPerDistance)), () => {
                        Discard();
                    });
                });
            });
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
            If(float(dashLength).equal(0), () => {
                If(segmentEnd.lessThanEqual(drawStart), () => {
                    const nextFragment = varyingProperty("vec2", "vNextFragment");
                    const endToNext = vec2(nextFragment.sub(endFragment));
                    const nextSegmentStartPointDistance = drawStart.sub(segmentEnd);
                    const nextSegmentEnd = attribute("positionOffset").w;
                    const nextSegmentFragmentsPerDistance = div(endToNext.length(), nextSegmentEnd.sub(segmentEnd));
                    const nextSegmentStartPointFragment = endFragment.add(endToNext
                        .normalize()
                        .mul(nextSegmentStartPointDistance)
                        .mul(nextSegmentFragmentsPerDistance));
                    If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), nextSegmentStartPointFragment, nextFragment, halfWidth.mul(nextSegmentFragmentsPerDistance)).not(), () => {
                        Discard();
                    });
                }).ElseIf(segmentStart
                    .lessThanEqual(drawStart)
                    .and(drawStart.lessThanEqual(segmentEnd)), () => {
                    If(offset.lessThanEqual(drawStart), () => {
                        const dx = drawStart.sub(offset);
                        If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
                            const nextFragment = varyingProperty("vec2", "vNextFragment");
                            const endToNext = vec2(nextFragment.sub(endFragment));
                            const nextSegmentStartPointDistance = drawStart.sub(segmentEnd);
                            const nextSegmentEnd = attribute("positionOffset").w;
                            const nextSegmentFragmentsPerDistance = div(endToNext.length(), nextSegmentEnd.sub(segmentEnd));
                            const nextSegmentStartPointFragment = endFragment.add(endToNext
                                .normalize()
                                .mul(nextSegmentStartPointDistance)
                                .mul(nextSegmentFragmentsPerDistance));
                            If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), nextSegmentStartPointFragment, nextFragment, halfWidth.mul(nextSegmentFragmentsPerDistance)).not(), () => {
                                Discard();
                            });
                        });
                    });
                });
            }).Else(() => {
                If(segmentEnd.lessThanEqual(drawStart), () => {
                    If(referenceDashEnd.lessThanEqual(drawStart), () => {
                        Discard();
                    }).ElseIf(referenceDashStart
                        .lessThanEqual(drawStart)
                        .and(drawStart.lessThanEqual(referenceDashEnd)), () => {
                        const nextFragment = varyingProperty("vec2", "vNextFragment");
                        const endToNext = vec2(nextFragment.sub(endFragment));
                        const nextSegmentStartPointDistance = drawStart.sub(segmentEnd);
                        const nextSegmentEnd = attribute("positionOffset").w;
                        const nextSegmentFragmentsPerDistance = div(endToNext.length(), nextSegmentEnd.sub(segmentEnd));
                        const nextSegmentStartPointFragment = endFragment.add(endToNext
                            .normalize()
                            .mul(nextSegmentStartPointDistance)
                            .mul(nextSegmentFragmentsPerDistance));
                        If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), nextSegmentStartPointFragment, nextFragment, halfWidth.mul(nextSegmentFragmentsPerDistance)).not(), () => {
                            Discard();
                        });
                    });
                    // .Else(/* drawStart.lessThanEqual(referenceDashStart) */ () => {
                    //   // No dash pattern will cause this fragment
                    //   // to be discarded.
                    // });
                }).ElseIf(segmentStart
                    .lessThanEqual(drawStart)
                    .and(drawStart.lessThanEqual(segmentEnd)), () => {
                    If(referenceDashEnd.lessThanEqual(drawStart), () => {
                        Discard();
                    }).ElseIf(referenceDashStart
                        .lessThanEqual(drawStart)
                        .and(drawStart.lessThanEqual(referenceDashEnd)), () => {
                        If(offset.lessThanEqual(drawStart), () => {
                            const dx = offset.distance(drawStart);
                            If(vec2(dx, dy).length().greaterThan(halfWidth), () => {
                                Discard();
                            });
                        });
                    });
                    // .Else(/* drawStart.lessThanEqual(referenceDashStart) */ () => {
                    //   // No dash pattern will cause this fragment
                    //   // to be discarded.
                    // });
                });
                // .Else(/* drawStart.lessThanEqual(segmentStart)*/ () => {
                //   // No dash pattern will cause this fragment
                //   // to be discarded.
                // });
            });
            // Exclude arrow segments from the stroke segment
            const segmentFragmentsPerDistance = reciprocal(segmentDistancePerFragment);
            const arrowTopVector = varyingProperty("vec2", "vArrowTopTailFragment").sub(varyingProperty("vec2", "vArrowTipFragment"));
            const arrowTopTailFragment = varyingProperty("vec2", "vArrowTipFragment").add(arrowTopVector.mul(select(float(drawArrow).equal(0), 1, endProportion)));
            const arrowBottomVector = varyingProperty("vec2", "vArrowBottomTailFragment").sub(varyingProperty("vec2", "vArrowTipFragment"));
            const arrowBottomTailFragment = varyingProperty("vec2", "vArrowTipFragment").add(arrowBottomVector.mul(select(float(drawArrow).equal(0), 1, endProportion)));
            If(float(arrow).and(isArrowSegment.not()), () => {
                If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), varyingProperty("vec2", "vArrowTipFragment"), arrowTopTailFragment, halfWidth.mul(segmentFragmentsPerDistance)), () => {
                    Discard();
                });
                If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), varyingProperty("vec2", "vArrowTipFragment"), arrowBottomTailFragment, halfWidth.mul(segmentFragmentsPerDistance)), () => {
                    Discard();
                });
            });
            // Exclude the top arrow segment from the bottom stroke segment
            If(float(arrow).and(varyingProperty("float", "vIsBottomArrowSegment").greaterThan(0)), () => {
                If(segmentCoversFragment(glFragCoord(viewport, viewportSize, devicePixelRatio, viewportOffset), varyingProperty("vec2", "vArrowTipFragment"), arrowTopTailFragment, halfWidth.mul(segmentFragmentsPerDistance)), () => {
                    Discard();
                });
            });
            return vec4(color, opacity);
        });
    }
}
//# sourceMappingURL=Fragment.js.map