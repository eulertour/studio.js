import {
  Discard,
  Fn,
  If,
  ShaderNodeObject,
  dot,
  float,
  mul,
  screenCoordinate,
  screenSize,
  select,
  uniform,
  varyingProperty,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import OperatorNode from "three/src/nodes/math/OperatorNode.js";
import * as THREE from "three/webgpu";

export const fragmentColor = uniform(new THREE.Color());
export const fragmentOpacity = uniform(1.0);

const sceneDimensions = vec2((8 * 16) / 9, 8);
const unitWidth = float(0.2);

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

const FragmentNode = Fn(() => {
  const vColor = varyingProperty("vec4", "vColor").toVar();

  const vStartFragment = varyingProperty("vec2", "vStartFragment");
  const vEndFragment = varyingProperty("vec2", "vEndFragment");
  const vNextFragment = varyingProperty("vec2", "vNextFragment");
  // const vPreviousFragment = varyingProperty("vec2", "vPreviousFragment");

  // [cssViewportWidth, cssViewportHeight, ?] * devicePixelRatio
  // [1280, 720, ?] * devicePixelRatio
  // [1408, 792, ?]
  const glFragCoord = vec3(
    screenCoordinate.x,
    screenSize.y.sub(screenCoordinate.y),
    screenCoordinate.z,
  ).toVar();
  const pixelsPerUnit = float(screenSize.y.div(sceneDimensions.y)).toVar();
  const pixelWidth = float(unitWidth.mul(pixelsPerUnit)).toVar(); // 9
  const halfWidthSquared = float(mul(0.25, pixelWidth).mul(pixelWidth)).toVar(); // 20.25
  const startToFrag = vec2(glFragCoord.xy.sub(vStartFragment)).toVar();
  // const previousToFrag = vec2(glFragCoord.xy.sub(vPreviousFragment)).toVar();

  const startToEnd = vec2(vEndFragment.sub(vStartFragment)).toVar();
  const startToEndDotProduct = float(dot(startToEnd, startToFrag)).toVar();
  const startToEndProjectionFactor = float(
    startToEndDotProduct.div(lengthSquared(startToEnd)),
  ).toVar();
  const startToEndProjection = vec2(
    startToEndProjectionFactor.mul(startToEnd),
  ).toVar();
  const startToEndNormal = vec2(startToFrag.sub(startToEndProjection)).toVar();

  const endToFrag = vec2(glFragCoord.xy.sub(vEndFragment)).toVar();
  const endToNext = vec2(vNextFragment.sub(vEndFragment)).toVar();
  const endToNextDotProduct = float(dot(endToNext, endToFrag)).toVar();
  const endToNextProjection = vec2(
    endToNextDotProduct.div(lengthSquared(endToNext).mul(endToNext)),
  ).toVar();
  const endToNextNormal = vec2(endToFrag.sub(endToNextProjection)).toVar();
  const nextToFrag = vec2(glFragCoord.xy.sub(vNextFragment)).toVar();

  // const startToPrevious = vec2(vPreviousFragment.sub(vStartFragment)).toVar();
  // const startToPreviousDotProduct = float(
  //   dot(startToPrevious, startToFrag),
  // ).toVar();
  // const startToPreviousProjectionFactor = float(
  //   startToPreviousDotProduct.div(lengthSquared(startToPrevious)),
  // ).toVar();
  // const startToPreviousProjection = vec2(
  //   startToPreviousProjectionFactor.mul(startToPrevious),
  // ).toVar();
  // const startToPreviousNormal = vec2(
  //   startToFrag.sub(startToPreviousProjection),
  // ).toVar();

  // const previousToStart = vec2(vStartFragment.sub(vPreviousFragment)).toVar();
  // const previousToStartDotProduct = float(
  //   dot(previousToStart, previousToFrag),
  // ).toVar();
  // const previousToStartProjectionFactor = float(
  //   previousToStartDotProduct.div(lengthSquared(previousToStart)),
  // ).toVar();
  // const previousToStartProjection = vec2(
  //   previousToStartProjectionFactor.mul(previousToStart),
  // ).toVar();
  // const previousToStartNormal = vec2(
  //   previousToFrag.sub(previousToStartProjection),
  // ).toVar();

  const coveredByCurrentSegment = segmentCoversFragment(
    halfWidthSquared,
    startToEnd,
    startToFrag,
    endToFrag,
    startToEndDotProduct,
    startToEndProjection,
    startToEndNormal,
  );

  const isLastSegment = vNextFragment.sub(vEndFragment).length().equal(0);
  const coveredByNextSegment = isLastSegment
    .not()
    .and(
      segmentCoversFragment(
        halfWidthSquared,
        endToNext,
        endToFrag,
        nextToFrag,
        endToNextDotProduct,
        endToNextProjection,
        endToNextNormal,
      ),
    );

  const shouldDiscardThisFragment = coveredByCurrentSegment
    .not()
    .or(coveredByNextSegment);
  // If(shouldDiscardThisFragment, () => Discard());
  const color = select(
    shouldDiscardThisFragment,
    vec4(1, 0, 0, 1),
    vec4(0, 1, 0, 1),
  );

  // return vec4(fragmentColor, fragmentOpacity),
  return color;
  // return vColor;
});

export default FragmentNode;
