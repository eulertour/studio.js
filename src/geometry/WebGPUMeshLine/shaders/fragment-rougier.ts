import {
  Discard,
  Fn,
  If,
  ShaderNodeObject,
  add,
  attribute,
  clamp,
  dot,
  float,
  floor,
  fract,
  max,
  mix,
  mul,
  remap,
  remapClamp,
  screenCoordinate,
  screenSize,
  select,
  sign,
  sqrt,
  sub,
  texture,
  uniform,
  varyingProperty,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import OperatorNode from "three/src/nodes/math/OperatorNode.js";
import * as THREE from "three/webgpu";

import {
  strokeColor,
  strokeOpacity,
  strokeWidth,
  worldUnitsPerStrokeWidth,
  worldTime,
  totalLength,
} from "../WebGPUMeshLine.js";
import atlas from "./atlas.js";
import atlasRougier from "./atlas-rougier.js";

const sceneDimensions = vec2((8 * 16) / 9, 8);

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
    // TODO: The segmentNormal calc leads to a subpixel render error on dashed right angles.
    const segmentStem = dotProduct
      .greaterThan(0)
      .and(lengthSquared(segmentProjection).lessThan(lengthSquared(segmentVec)))
      .and(lengthSquared(segmentNormal).lessThan(halfWidthSquared));
    return segmentStem.or(segmentStart).or(segmentEnd);
  },
);

const fragmentFromProportion = Fn(
  ([
    proportion,
    startProportion,
    endProportion,
    previousFragment,
    startFragment,
    endFragment,
    nextFragment,
  ]: [
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
  ]) => {
    const pixelDistancePerProportion = endFragment
      .distance(startFragment)
      .div(endProportion.sub(startProportion));
    If(proportion.lessThan(startProportion), () => {
      const offsetVector = previousFragment.sub(startFragment).normalize();
      const offsetProportion = startProportion.sub(proportion);
      const offsetPixelLength = offsetProportion.mul(
        pixelDistancePerProportion,
      );
      return startFragment.add(offsetVector.mul(offsetPixelLength));
    })
      .ElseIf(proportion.lessThan(endProportion), () => {
        const offsetVector = endFragment.sub(startFragment);
        const offsetProportion = endProportion.sub(startProportion);
        const offsetPixelLength = offsetProportion.mul(
          pixelDistancePerProportion,
        );
        return startFragment.add(offsetVector.mul(offsetPixelLength));
      })
      .Else(() => {
        const offsetVector = nextFragment.sub(endFragment);
        const offsetProportion = proportion.sub(endProportion);
        const offsetPixelLength = offsetProportion.mul(
          pixelDistancePerProportion,
        );
        return endFragment.add(offsetVector.mul(offsetPixelLength));
      });
  },
);

const inverseMix = Fn(
  ([a, b, v]: [
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
  ]) => v.sub(a).div(b.sub(a)),
);

const FragmentNode = Fn(() => {
  const vColor = varyingProperty("vec4", "vColor").toVar();

  const startFragment = varyingProperty("vec2", "vStartFragment");
  const endFragment = varyingProperty("vec2", "vEndFragment");
  const nextFragment = varyingProperty("vec2", "vNextFragment");
  const previousFragment = varyingProperty("vec2", "vPreviousFragment");

  // [cssViewportWidth, cssViewportHeight, ?] * devicePixelRatio
  // [1280, 720, ?] * devicePixelRatio
  // [1408, 792, ?]
  const glFragCoord = vec3(
    screenCoordinate.x,
    screenSize.y.sub(screenCoordinate.y),
    screenCoordinate.z,
  ).toVar();
  const pixelsPerUnit = float(screenSize.y.div(sceneDimensions.y)).toVar();
  const pixelWidth = strokeWidth
    .mul(worldUnitsPerStrokeWidth)
    .mul(pixelsPerUnit);
  const halfWidthSquared = float(mul(0.25, pixelWidth).mul(pixelWidth)).toVar();
  // const previousToFrag = vec2(glFragCoord.xy.sub(vPreviousFragment)).toVar();

  const startToFrag = vec2(glFragCoord.xy.sub(startFragment)).toVar();
  const startToEnd = vec2(endFragment.sub(startFragment)).toVar();
  const startToEndDotProduct = float(dot(startToEnd, startToFrag)).toVar();
  const startToEndProjection = vec2(
    startToEndDotProduct.div(lengthSquared(startToEnd)).mul(startToEnd),
  ).toVar();
  const startToEndNormal = vec2(startToFrag.sub(startToEndProjection)).toVar();

  const endToFrag = vec2(glFragCoord.xy.sub(endFragment)).toVar();
  const endToNext = vec2(nextFragment.sub(endFragment)).toVar();
  const endToNextDotProduct = float(dot(endToNext, endToFrag)).toVar();
  const endToNextProjection = vec2(
    endToNextDotProduct.div(lengthSquared(endToNext).mul(endToNext)),
  ).toVar();
  const endToNextNormal = vec2(endToFrag.sub(endToNextProjection)).toVar();

  const nextToFrag = vec2(glFragCoord.xy.sub(nextFragment)).toVar();

  const startToPrevious = vec2(previousFragment.sub(startFragment)).toVar();
  const startToPreviousDotProduct = float(
    dot(startToPrevious, startToFrag),
  ).toVar();
  const startToPreviousProjectionFactor = float(
    startToPreviousDotProduct.div(lengthSquared(startToPrevious)),
  ).toVar();
  const startToPreviousProjection = vec2(
    startToPreviousProjectionFactor.mul(startToPrevious),
  ).toVar();
  const startToPreviousNormal = vec2(
    startToFrag.sub(startToPreviousProjection),
  ).toVar();

  const periodLength = float(2);
  const startLength = totalLength.mul(attribute("startProportion"));
  const endLength = totalLength.mul(attribute("endProportion"));
  const tangent = select(
    dot(startToFrag, startToEnd).lessThan(0),
    vec2(0, 0),
    select(
      startToEndProjection.length().greaterThan(startToEnd.length()),
      startToEnd,
      startToEndProjection,
    ),
  );
  const tangentFraction = tangent.length().div(startToEnd.length());
  const representativeFragment = mix(
    startFragment,
    endFragment,
    tangentFraction,
  );
  const distancePerFragment = endLength
    .sub(startLength)
    .div(startToEnd.length());
  const fragmentsPerDistance = float(1).div(distancePerFragment);

  // const dx = mix(startLength, endLength, tangentFraction);
  const dx = startLength.add(
    startToEndProjection
      .length()
      .mul(distancePerFragment)
      .mul(sign(dot(startToEnd, startToEndProjection))),
  );
  // const dy = startToEndNormal.length().mul(distancePerFragment);
  const dy = startToEndNormal
    .length()
    .mul(distancePerFragment)
    .mul(
      sign(dot(vec2(startToEnd.y.negate(), startToEnd.x), startToEndNormal)),
    );
  const dashWidth = float(0.5);
  const dashPeriod = float(3); // sum([1, 2])
  const freqPatternLength = dashPeriod.mul(dashWidth);
  // TODO: Some corner error with time = 0 on a square with side length 2
  // const dashPhase = float(0);
  const dashPhase = float(0).sub(worldTime);
  const u = dx.add(dashPhase.mul(dashWidth)).mod(freqPatternLength).toVar();
  const u2 = dx.add(dashPhase.mul(dashWidth)).mod(freqPatternLength);
  const v = texture(atlasRougier, vec2(u2.div(freqPatternLength), 0));
  const dashCenterReferencePoint = v.x.mul(255).mul(dashWidth);
  const dashType = v.y;
  const _start = v.z.mul(255).mul(dashWidth);
  const _stop = v.a.mul(255).mul(dashWidth);
  const dashStart = dx.sub(u).add(_start);
  const dashStop = dx.sub(u).add(_stop);
  const lineStart = float(0);
  const lineStop = totalLength;
  const segmentStart = startLength;
  const segmentStop = endLength;

  const d = dy.toVar();

  const color = vec4(1, 0, 0, 1).toVar();
  const red = vec4(1, 0, 0, 1);
  const green = vec4(0, 1, 0, 1);
  const blue = vec4(0, 0, 1, 0.5);
  const purple = vec4(1, 0, 1, 1);

  const halfWidth = float(0.2);
  If(dashStop.lessThanEqual(lineStart), () => Discard());
  If(dashStart.greaterThanEqual(lineStop), () => Discard());

  // Line start
  If(
    dx
      .lessThanEqual(lineStart)
      .and(dashStart.lessThanEqual(lineStart))
      .and(dashStop.greaterThanEqual(lineStart)),
    () => {
      // u.assign(dx.abs());
      const newU = dx.abs();
      If(sqrt(newU.mul(newU).add(dy.mul(dy))).lessThanEqual(halfWidth), () => {
        color.assign(blue);
      }).Else(() => {
        Discard();
      });
    },
  )
    // Line end
    .ElseIf(
      dx
        .greaterThanEqual(lineStop)
        .and(dashStop.greaterThanEqual(lineStop))
        .and(dashStart.lessThanEqual(lineStop)),
      () => {
        // u.assign(dx.sub(lineStop));
        const newU = dx.sub(lineStop);
        If(
          sqrt(newU.mul(newU).add(dy.mul(dy))).lessThanEqual(halfWidth),
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
      If(dy.abs().lessThanEqual(halfWidth), () => {
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
      If(sqrt(newU.mul(newU).add(dy.mul(dy))).lessThanEqual(halfWidth), () => {
        color.assign(blue);
      }).Else(() => {
        Discard();
      });
    })
    // Dash start
    .ElseIf(dashType.greaterThan(0), () => {
      // +1
      // u.assign(max(dashCenterReferencePoint.sub(u), 0));
      const newU = max(dashCenterReferencePoint.sub(u), 0);
      If(sqrt(newU.mul(newU).add(dy.mul(dy))).lessThanEqual(halfWidth), () => {
        color.assign(blue);
      }).Else(() => {
        Discard();
      });
    });

  If(segmentStart.notEqual(lineStart), () => {
    // TODO: distancePerFragment was calcuated based on the
    // 3D length of the current segment. This calculation
    // should use a new constant based on the 3D length of
    // the previous segment.
    If(dashStart.lessThanEqual(segmentStart), () => {
      const previousSegmentDashStartDistance = segmentStart.sub(dashStart);
      const previousSegmentDashStartFragment = startFragment.add(
        startToPrevious
          .normalize()
          .mul(previousSegmentDashStartDistance)
          .mul(fragmentsPerDistance),
      );
      const fragmentHalfWidth = halfWidth.mul(fragmentsPerDistance);
      const halfWidthSquared = fragmentHalfWidth.mul(fragmentHalfWidth);
      const segmentVec = startFragment.sub(previousSegmentDashStartFragment);
      const startToFrag = glFragCoord.xy.sub(previousSegmentDashStartFragment);
      const endToFrag = glFragCoord.xy.sub(startFragment);
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
      If(dx.lessThanEqual(segmentStart), () => {
        Discard();
      });
    });
  });

  If(segmentStop.notEqual(lineStop), () => {
    If(dashStart.greaterThanEqual(segmentStop), () => Discard());
    If(
      dx
        .greaterThanEqual(segmentStop)
        .and(dashStop.greaterThanEqual(segmentStop))
        .and(dashStart.lessThanEqual(segmentStop)),
      () => {
        const newU = dx.sub(segmentStop);
        If(sqrt(newU.mul(newU).add(dy.mul(dy))).lessThan(halfWidth), () => {
          color.assign(blue);
        }).Else(() => {
          Discard();
        });
      },
    );
  });

  If(
    segmentStop.equal(lineStop).and(endFragment.notEqual(nextFragment)),
    () => {
      const u = dashPhase.mul(dashWidth).mod(freqPatternLength);
      const v = texture(atlasRougier, vec2(u.div(freqPatternLength), 0));
      const dashCenterReferencePoint = v.x.mul(255).mul(dashWidth);
      const dashType = v.y;
      const _start = v.z.mul(255).mul(dashWidth);
      const _stop = v.a.mul(255).mul(dashWidth);
      const firstSegmentDashStartDistance = max(u.negate().add(_start), 0);
      const firstSegmentDashStopDistance = u.negate().add(_stop);

      const firstSegmentStartFragment = endFragment;
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
          .mul(fragmentsPerDistance),
      );
      const firstSegmentDashEndFragment = firstSegmentStartFragment.add(
        firstSegmentStartToEnd
          .normalize()
          .mul(firstSegmentDashStopDistance)
          .mul(fragmentsPerDistance),
      );

      const fragmentHalfWidth = halfWidth.mul(fragmentsPerDistance);
      const halfWidthSquared = fragmentHalfWidth.mul(fragmentHalfWidth);
      const segmentVec = firstSegmentDashEndFragment.sub(
        firstSegmentDashStartFragment,
      );
      const startToFrag = glFragCoord.xy.sub(firstSegmentDashStartFragment);
      const endToFrag = glFragCoord.xy.sub(firstSegmentDashEndFragment);
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
    },
  );

  return color;
});

export default FragmentNode;
