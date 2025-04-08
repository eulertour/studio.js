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
  const length = mix(startLength, endLength, tangentFraction);
  const periodNumber = floor(length.div(periodLength));
  const periodFract = fract(length.div(periodLength));
  const fullPeriodLength = periodNumber.mul(periodLength);
  const fractPeriodLength = periodFract.mul(periodLength);

  const discreteUBar = floor(periodFract.div(1 / 255)).mul(1 / 255);
  const discreteWorldTime = floor(worldTime.div(5).div(1 / 255)).mul(1 / 255);
  const mappedUBar = discreteUBar.sub(discreteWorldTime).mod(1);
  const mappedUStar = texture(atlas, vec2(mappedUBar, 0)).x;
  const mappedUStarLength = fullPeriodLength.add(periodLength.mul(mappedUStar));

  const representativeFragment = mix(
    startFragment,
    endFragment,
    tangentFraction,
  );
  const representativeToFragment = glFragCoord.xy.sub(representativeFragment);

  // const targetFragment = mix(startFragment, endFragment, uStar);
  const mappedUStarFragment = select(
    mappedUStarLength.lessThanEqual(endLength),
    remap(
      mappedUStarLength,
      startLength,
      endLength,
      startFragment,
      endFragment,
    ),
    remap(
      mappedUStarLength,
      startLength,
      endLength,
      startFragment,
      endFragment,
    ),
  );

  const mappedUBarLength = fullPeriodLength.add(mappedUBar.mul(periodLength));
  const mappedGlFragCoord = remap(
    mappedUBarLength,
    startLength,
    endLength,
    startFragment,
    endFragment,
  ).add(representativeToFragment);

  const color = select(
    mappedGlFragCoord.xy.distance(mappedUStarFragment).lessThan(20),
    // uStar.greaterThan(1),
    vec4(0, 1, 0, 1),
    vec4(1, 0, 0, 1),
  );
  // If(glFragCoord.xy.distance(targetFragment).lessThanEqual(20).not(), () =>
  //   Discard(),
  // );

  // const targetLength = float(4);
  // // NOTE: This seems to work for going length -> fragment
  // const targetFragment = remap(
  //   worldTime.mod(1),
  //   0,
  //   1,
  //   startFragment,
  //   endFragment,
  // );

  // const targetFullPeriod = floor(targetLength.div(periodLength));
  // const targetFractPeriod = fract(targetLength.div(periodLength));
  //
  // const targetRepresentativeFragment = remap(
  //   periodLength.mul(representativeFullPeriod),
  //   0,
  //   endLength,
  //   startFragment,
  //   endFragment,
  // );

  // const u = startToEndProjection.length().div(periodLength);
  //
  // const fragmentLength = remap(u, 0, 1, startLength, endLength);
  // const targetPeriodLength = worldTime.mod(1).mul(periodLength);
  //
  // // const targetLength = worldTime.mod(endLength);
  // const fullPeriodLength = floor(fragmentLength.div(periodLength)).mul(
  //   periodLength,
  // );
  // const fractionalPeriod = fract(fragmentLength.div(periodLength))
  //   .add(worldTime)
  //   .mod(1);
  // const fractionalPeriodLength = fractionalPeriod.mul(periodLength);
  // const uStarFragment = remap(
  //   float(0),
  //   0,
  //   periodLength,
  //   startFragment,
  //   endFragment,
  // );
  // const color = select(
  //   glFragCoord.xy.distance(targetFragment).lessThan(20),
  //   vec4(0, 1, 0, 1),
  //   vec4(1, 0, 0, 1),
  // );
  // If(
  //   glFragCoord.xy
  //     .distance(targetRepresentativeFragment)
  //     .lessThanEqual(20)
  //     .not(),
  //   () => Discard(),
  // );

  // const periodNumber = floor(targetLength.div(periodLength));
  // const periodFract = fract(targetLength.div(periodLength));
  // return vec4(strokeColor, fractionalPeriod);
  return color;

  // const uStarFragment = remap(
  //   worldTime.mod(endLength),
  //   startLength,
  //   endLength,
  //   startFragment,
  //   endFragment,
  // );

  const periodStartLength = periodNumber.mul(periodLength);
  const periodEndLength = periodNumber.add(1).mul(periodLength);

  const periodStartFragment = remap(
    periodStartLength,
    startLength,
    endLength,
    startFragment,
    endFragment,
  );
  const periodEndFragment = remap(
    periodEndLength,
    startLength,
    endLength,
    startFragment,
    endFragment,
  );

  const uBar = periodFract.sub(worldTime).mod(1);
  // const uStar = texture(atlas, vec2(uBar, 0)).x;
  // const color = select(
  //   uStar.greaterThanEqual(0).and(uBar.lessThan(1)),
  //   vec4(0, 1, 0, 1),
  //   vec4(1, 0, 0, 1),
  // );
  //
  // const lengthFromUBar = add(periodNumber, uBar).mul(periodLength);
  // const lengthFromFract = add(periodNumber, periodFract).mul(periodLength);
  // const lengthFromUStar = add(periodNumber, uStar).mul(periodLength);
  // const uStarFragment = remap(
  //   uStar,
  //   0,
  //   1,
  //   periodStartFragment,
  //   periodEndFragment,
  // );

  /**
   *  [0, 1, 2, 3, 4]
   *  [1, 2, 3, 4, 0]
   */

  // const periodNumber = floor(proportion.div(1 / 4));
  // const uBar = proportion.sub(periodNumber.mul(1 / 4)).mul(4);
  // const endFragmentComp = remap(
  //   endProportion,
  //   startProportion,
  //   endProportion,
  //   startFragment,
  //   endFragment,
  // );
  // const color = select(
  //   uStarFragment.distance(glFragCoord.xy).lessThanEqual(20),
  //   // lengthFromUBar.lessThan(0.5),
  //   // uBar.lessThan(0.5),
  //   // periodNumber.equal(0).and(uBar.lessThan(0)),
  //   // periodNumber.equal(0).and(uBar.sub(worldTime.mod(1)).lessThan(0)),
  //   vec4(0, 1, 0, 1),
  //   vec4(1, 0, 0, 1),
  // );

  // NOTE: Convert uStar into a proportion
  // const uStarLength = periodNumber
  //   .mul(periodLength)
  //   .add(uStar.mul(periodLength));
  // const color = select(
  //   uStarProportion.lessThanEqual(1),
  //   vec4(0, 1, 0, 1),
  //   vec4(1, 0, 0, 1),
  // );

  // const uStarFragment = mix(
  //   startFragment,
  //   endFragment,
  //   inverseMix(startProportion, endProportion, uStarProportion),
  // );
  // const color = select(
  //   // length.lessThan(4.2426),
  //   lengthFromPeriod.lessThan(4.2426),
  //   vec4(0, 1, 0, 1),
  //   vec4(1, 0, 0, 1),
  // );

  // const uStarOnSegment = startProportion
  //   .lessThanEqual(uStarProportion)
  //   .and(uStarProportion.lessThan(endProportion));
  // const closeToUStar = glFragCoord.xy.distance(uStarFragment).lessThan(8);
  // const shouldIncludeFragment = uStarOnSegment.and(closeToUStar);

  // If(shouldIncludeFragment.not(), () => Discard());

  // const color = select(
  //   shouldIncludeFragment,
  //   vec4(0, 1, 0, 1),
  //   vec4(1, 0, 0, 1),
  // );

  // return vec4(strokeColor, strokeOpacity);
  // return vec4(strokeColor, uStar);
  // return color;
  // return vec4(strokeColor, uBar);
  // return vec4(strokeColor, length.div(8.485));
  // return textureData;
  // return vColor;
});

export default FragmentNode;
