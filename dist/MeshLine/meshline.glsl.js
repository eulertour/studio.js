import THREE from "../three.js";
export const MESHLINE_VERT = /*glsl*/ `
${THREE.ShaderChunk.logdepthbuf_pars_vertex}
${THREE.ShaderChunk.fog_pars_vertex}

// Passed by WebGLProgram
// https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform vec4 viewport;
uniform float unitWidth;

// Passed by WebGLProgram
// https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram
// attribute vec3 position;
attribute vec3 endPosition;
attribute vec3 nextPosition;
attribute vec3 previousPosition;
attribute float textureCoords;
attribute float proportion;
attribute float endProportion;

varying vec2 vStartFragment;
varying vec2 vEndFragment;
varying vec2 vNextFragment;
varying vec2 vPreviousFragment;
varying float vStartProportion;
varying float vEndProportion;
varying float vFlag;
varying float vArrow;
varying float vBeforeArrow;

float eq(float x, float y) {
  return 1.0 - abs(sign(x - y));
}

vec2 fragmentCoords(vec4 v) {
  vec2 viewportFragment = viewport.zw / 2. * (1. + v.xy / v.w);
  viewportFragment += viewport.xy;
  return viewportFragment;
}

void main() {
  vStartProportion = proportion;
  vEndProportion = endProportion;

  mat4 modelViewProjection = projectionMatrix * modelViewMatrix;
  vec4 start = modelViewProjection * vec4(position, 1.0);
  vec4 end = modelViewProjection * vec4(endPosition, 1.0);
  vec4 next = modelViewProjection * vec4(nextPosition, 1.0);
  vec4 previous = modelViewProjection * vec4(previousPosition, 1.0);

  vStartFragment = fragmentCoords(start);
  vEndFragment = fragmentCoords(end);
  vNextFragment = fragmentCoords(next);
  vPreviousFragment = fragmentCoords(previous);

  // Extract bools.
  float remaining = textureCoords;
  vBeforeArrow = floor(0.125 * textureCoords);
  remaining -= 8. * vBeforeArrow;
  vArrow = floor(0.25 * remaining);
  remaining -= 4. * vArrow;
  float startEnd = floor(0.5 * remaining);
  remaining -= 2. * startEnd;
  float bottomTop = remaining;

  // segmentVector is the vector from the start to the end of the current segment.
  // segmentNormal is the normal of the segmentVector in the +theta direction.
  // Add 0.2 so all pixels are covered.
  vec2 segmentVec = 1.2 * normalize(vEndFragment - vStartFragment);
  vec2 segmentNormal = vec2(-segmentVec.y, segmentVec.x);

  // [0, 1] -> [1, -1]
  segmentVec *= (2. * startEnd - 1.);
  segmentNormal *= (2. * bottomTop - 1.);

  // fragmentOffset is the vector offset from the start or end of the current segment
  // to a corner of the polygon representing it. It's represented by the diagonal lines
  // in the diagram below.
  // *-------------------*
  // |\                 /|
  // | *---------------* |
  // |/                 \|
  // *-------------------*
  vec2 fragmentOffset
    = 0.75 * unitWidth * segmentVec
    + 0.75 * unitWidth * segmentNormal
           * (eq(vArrow, 0.) + eq(vArrow, 1.) * 2.618033988); // 1 + phi

  gl_Position = start * eq(startEnd, 0.) + end * eq(startEnd, 1.);
  gl_Position.xy += (projectionMatrix * vec4(fragmentOffset, 0., 1.)).xy;

  ${THREE.ShaderChunk.logdepthbuf_vertex}
  ${THREE.ShaderChunk.fog_vertex && /*glsl*/ "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );"}
  ${THREE.ShaderChunk.fog_vertex}
}`;
export const MESHLINE_FRAG = /*glsl*/ `
${THREE.ShaderChunk.fog_pars_fragment}
${THREE.ShaderChunk.logdepthbuf_pars_fragment}

uniform vec3 color;
uniform float unitWidth;
uniform float opacity;
uniform vec2 drawRange;
uniform vec4 viewport;
uniform vec4 dimensions;
uniform float dashLength;
uniform float totalLength;
uniform float dashOffset;

varying vec2 vStartFragment;
varying vec2 vEndFragment;
varying vec2 vNextFragment;
varying vec2 vPreviousFragment;
varying float vStartProportion;
varying float vEndProportion;
varying float vFlag;
varying float vArrow;
varying float vBeforeArrow;

float gt(float x, float y) { return max(sign(x - y), 0.0); }
float lt(float x, float y) { return max(sign(y - x), 0.0); }
float and(float a, float b) { return a * b; }
float and(float a, float b, float c) { return a * b * c; }
float or(float a, float b, float c) { return min(a + b + c, 1.0); }
float lengthSquared(vec2 vec) { return dot(vec, vec); }

float segmentCoversFragment(
  float halfWidthSquared,
  vec2 segmentVec,
  vec2 startToFrag,
  vec2 endToFrag,
  float dotProduct,
  vec2 segmentProjection,
  vec2 segmentNormal
) {
  float segmentStart = lt(lengthSquared(startToFrag), halfWidthSquared);
  float segmentEnd = lt(lengthSquared(endToFrag), halfWidthSquared);
  float segmentStem = and(
    gt(dotProduct, 0.),
    lt(lengthSquared(segmentProjection), lengthSquared(segmentVec)),
    lt(lengthSquared(segmentNormal), halfWidthSquared)
  );
  return or(segmentStem, segmentStart, segmentEnd);
}

float arrowCoversFragment(
  vec2 startToEnd,
  vec2 startToEndProjection,
  vec2 startToEndNormal,
  float unitWidth,
  float pixelsPerUnit
) {
  float x = sqrt(lengthSquared(startToEndProjection));
  float y = sqrt(lengthSquared(startToEndNormal));
  float rise = 0.5 * unitWidth * pixelsPerUnit * 2.618033988;
  // float run = sqrt(lengthSquared(startToEnd));
  float m = -rise * inversesqrt(lengthSquared(startToEnd));
  float b = rise;
  return lt(y, m * x + b);
}

float segmentIntersectsFragment(
  vec2 segmentStart,
  vec2 segmentEnd,
  vec2 fragment
) {
  vec2 segmentVector = segmentEnd - segmentStart;
  vec2 fragmentVector = fragment - segmentStart;
  float dotProduct = dot(segmentVector, fragmentVector);
  float lengthProduct = length(fragmentVector) * length(segmentVector);
  return lt(abs(dotProduct - lengthProduct), 0.1);
}

struct DashCoversFragmentData {
  float totalLength;
  float fragmentProportion;
  vec2 previousToStart;
  float pixelsPerUnit;
  vec2 startToEnd;
  vec2 startToEndNormal;
  vec2 previousToStartNormal;
  vec2 startToEndProjection;
  vec2 startToFrag;
  vec2 previousToStartProjection;
  vec2 endToFrag;
  float cursorWidth;
};

float dashCoversFragment(
    float cursorStartLength,
    float cursorEndLength,
    DashCoversFragmentData data
) {
  float startLength = vStartProportion * data.totalLength;
  float endLength = vEndProportion * data.totalLength;
  float previousLength = startLength - length(data.previousToStart) / data.pixelsPerUnit;
  float fragmentLength = data.fragmentProportion * data.totalLength;

  vec2 cursorStartFragment;
  if (startLength < cursorEndLength && cursorEndLength < endLength) {
    // Handle the first dot when it lies on the segment.
    cursorStartFragment = vStartFragment + normalize(data.startToEnd) * data.pixelsPerUnit * (cursorEndLength - startLength);
    if (length(gl_FragCoord.xy - cursorStartFragment) < data.cursorWidth) {
      return 1.;
    }
  } else if (previousLength < cursorEndLength && cursorEndLength < startLength) {
    // Handle the first dot when it comes before the segment.
    cursorStartFragment = vPreviousFragment + normalize(data.previousToStart) * data.pixelsPerUnit * (cursorEndLength - previousLength);
    if (length(gl_FragCoord.xy - cursorStartFragment) < data.cursorWidth) {
      return 1.;
    }
  }

  vec2 cursorEndFragment;
  if (startLength < cursorStartLength && cursorStartLength < endLength) {
    // Handle the second dot when it lies on the segment.
    cursorEndFragment = vStartFragment + normalize(data.startToEnd) * data.pixelsPerUnit * (cursorStartLength - startLength);
    if (length(gl_FragCoord.xy - cursorEndFragment) < data.cursorWidth) {
      return 1.;
    }
  } else if (previousLength < cursorStartLength && cursorStartLength < startLength) {
    // Handle the second dot when it comes before the segment.
    cursorEndFragment = vPreviousFragment + normalize(data.previousToStart) * data.pixelsPerUnit * (cursorStartLength - previousLength);
    if (length(gl_FragCoord.xy - cursorEndFragment) < data.cursorWidth) {
      return 1.;
    }
  }

  // // The first and second cursors are on the segment.
  // if (
  //   segmentIntersectsFragment(vStartFragment, vEndFragment, cursorStartFragment) > 0.
  //   && segmentIntersectsFragment(vStartFragment, vEndFragment, cursorEndFragment) > 0.
  //   && dot(cursorEndFragment - gl_FragCoord.xy, cursorStartFragment - gl_FragCoord.xy) < 0.
  // ) {
  //   if (length(data.startToEndNormal) < data.cursorWidth) {
  //     return 1.;
  //   }
  // }

  // The first cursor hasn't yet reached the start of the segment.
  if (
    segmentIntersectsFragment(vPreviousFragment, vStartFragment, cursorStartFragment) > 0.
    && segmentIntersectsFragment(vPreviousFragment, vStartFragment, cursorEndFragment) > 0.
    && dot(cursorEndFragment - gl_FragCoord.xy, cursorStartFragment - gl_FragCoord.xy) < 0.
  ) {
    if (length(data.previousToStartNormal) < data.cursorWidth) {
      return 1.;
    }
  }

  // The first cursor is on the segment and the second hasn't yet reached its start. Color
  // the fragments between the start and the first cursor.
  vec2 projectedFragment = vStartFragment + data.startToEndProjection;
  if (
    segmentIntersectsFragment(vStartFragment, vEndFragment, cursorStartFragment) > 0.
    && segmentIntersectsFragment(vStartFragment, vEndFragment, cursorEndFragment) == 0.
  ) {
    if (
      dot(vStartFragment - projectedFragment, cursorStartFragment - projectedFragment) < 0.
      || length(data.startToFrag) < data.cursorWidth
    ) {
      if (length(data.startToEndNormal) < data.cursorWidth) {
        return 1.;
      }
    }
  }

  // The first cursor is on the segment and the second hasn't yet reached its start. Color
  // the fragments before the start.
  if (
    segmentIntersectsFragment(vStartFragment, vEndFragment, cursorStartFragment) > 0.
    && segmentIntersectsFragment(vStartFragment, vEndFragment, cursorEndFragment) == 0.
    && length(cursorEndFragment - vPreviousFragment) < length(data.previousToStartProjection)
    && length(data.previousToStartProjection) < length(vStartFragment - vPreviousFragment)
  ) {
    if (length(data.previousToStartNormal) < data.cursorWidth) {
      return 1.;
    }
  }

  // The second cursor is on the segment and the first is not.
  if (
    segmentIntersectsFragment(vStartFragment, vEndFragment, cursorEndFragment) > 0.
    && segmentIntersectsFragment(vStartFragment, vEndFragment, cursorStartFragment) == 0.
    && fragmentLength > cursorStartLength
  ) {
    if (
      length(data.startToEndProjection) < length(data.startToEnd)
      || length(data.endToFrag) < data.cursorWidth
    ) {
      if (length(data.startToEndNormal) < data.cursorWidth) {
        return 1.;
      }
    }
  }

  return 0.;
}

void main() {
    ${THREE.ShaderChunk.logdepthbuf_fragment}

    float pixelsPerUnit = viewport.w / dimensions.y;
    float pixelWidth = unitWidth * pixelsPerUnit;
    float halfWidthSquared = 0.25 * pixelWidth * pixelWidth;
    vec2 startToFrag = gl_FragCoord.xy - vStartFragment;
    vec2 previousToFrag = gl_FragCoord.xy - vPreviousFragment;

    vec2 startToEnd = vEndFragment - vStartFragment;
    float startToEndDotProduct = dot(startToEnd, startToFrag);
    float startToEndProjectionFactor = startToEndDotProduct / lengthSquared(startToEnd);
    vec2 startToEndProjection = startToEndProjectionFactor * startToEnd;
    vec2 startToEndNormal = startToFrag - startToEndProjection;

    vec2 endToFrag = gl_FragCoord.xy - vEndFragment;
    vec2 endToNext = vNextFragment - vEndFragment;
    float endToNextDotProduct = dot(endToNext, endToFrag);
    vec2 endToNextProjection = endToNextDotProduct / lengthSquared(endToNext) * endToNext;
    vec2 endToNextNormal = endToFrag - endToNextProjection;
    vec2 nextToFrag = gl_FragCoord.xy - vNextFragment;

    vec2 startToPrevious = vPreviousFragment - vStartFragment;
    float startToPreviousDotProduct = dot(startToPrevious, startToFrag);
    float startToPreviousProjectionFactor = startToPreviousDotProduct / lengthSquared(startToPrevious);
    vec2 startToPreviousProjection = startToPreviousProjectionFactor * startToPrevious;
    vec2 startToPreviousNormal = startToFrag - startToPreviousProjection;

    vec2 previousToStart = vStartFragment - vPreviousFragment;
    float previousToStartDotProduct = dot(previousToStart, previousToFrag);
    float previousToStartProjectionFactor = previousToStartDotProduct / lengthSquared(previousToStart);
    vec2 previousToStartProjection = previousToStartProjectionFactor * previousToStart;
    vec2 previousToStartNormal = previousToFrag - previousToStartProjection;

    // For regular segments, exclude the fragment if it is covered by the next segment.
    if (
      vBeforeArrow == 0.
      && vArrow == 0.
      && vNextFragment != vEndFragment
      && dashLength == 0.
      && segmentCoversFragment(
        halfWidthSquared,
        endToNext,
        endToFrag,
        nextToFrag,
        endToNextDotProduct,
        endToNextProjection,
        endToNextNormal
      ) == 1.
    ) discard;

    // For segments preceding an arrow, exclude the fragment if it is covered by the arrow.
    if (
      vBeforeArrow == 1.
      && vArrow == 0.
      && endToNextDotProduct > 0.
    ) discard;

    // For segments that aren't part of arrows, exclude the fragment if it is not covered by the segment.
    if (
      vArrow == 0.
      && segmentCoversFragment(
        halfWidthSquared,
        startToEnd,
        startToFrag,
        endToFrag,
        startToEndDotProduct,
        startToEndProjection,
        startToEndNormal
      ) == 0.
    ) discard;

    // For segments that are part of arrows, exclude fragments that aren't in the direction of the arrow.
    if (vArrow == 1. && startToEndDotProduct < 0.) discard;

    // For segments that are part of arrows, exclude fragments that aren't covered by the arrow.
    if (
      vArrow == 1.
      && arrowCoversFragment(
        startToEnd,
        startToEndProjection,
        startToEndNormal,
        unitWidth,
        pixelsPerUnit
      ) == 0.
    ) discard;

    // Exclude fragments that are outside the draw range.
    float alpha = clamp(startToEndProjectionFactor, 0., 1.);
    float fragmentProportion = mix(vStartProportion, vEndProportion, alpha);
    if (fragmentProportion < drawRange[0] || drawRange[1] < fragmentProportion) discard;

    // Handle dashes.
    if (dashLength > 0.) {
      float cursorWidth = pixelWidth / 2.;
      float fragmentLength = fragmentProportion * totalLength;

      float modDashOffset2 = mod(dashOffset, 2. * dashLength);
      float dashLengthDivision2 = (fragmentLength + 2. * dashLength - modDashOffset2) / dashLength;
      float dashLengthQuotient2 = floor(dashLengthDivision2);
      float previousDashEndLength = dashLengthQuotient2 * dashLength - (2. * dashLength - modDashOffset2);

      DashCoversFragmentData dashCoversFragmentData;
      dashCoversFragmentData.totalLength = totalLength;
      dashCoversFragmentData.fragmentProportion = fragmentProportion;
      dashCoversFragmentData.previousToStart = previousToStart;
      dashCoversFragmentData.pixelsPerUnit = pixelsPerUnit;
      dashCoversFragmentData.startToEnd = startToEnd;
      dashCoversFragmentData.startToEndNormal = startToEndNormal;
      dashCoversFragmentData.previousToStartNormal = previousToStartNormal;
      dashCoversFragmentData.startToEndProjection = startToEndProjection;
      dashCoversFragmentData.startToFrag = startToFrag;
      dashCoversFragmentData.previousToStartProjection = previousToStartProjection;
      dashCoversFragmentData.endToFrag = endToFrag;
      dashCoversFragmentData.cursorWidth = cursorWidth;

      float coveredByDash = 0.;

      if (mod(dashLengthQuotient2, 2.) == 0.) {
        // This fragment's projection is within a dash.
        coveredByDash += 1.;
      } else {
        // This fragment's projection is not within a dash, but it
        // may be covered by the previous or next dash's cap.
        // previous
        coveredByDash += dashCoversFragment(
          previousDashEndLength - dashLength,
          previousDashEndLength,
          dashCoversFragmentData
        );
        // next
        coveredByDash += dashCoversFragment(
          previousDashEndLength + dashLength,
          previousDashEndLength + 2. * dashLength,
          dashCoversFragmentData
        );
      }

      if (coveredByDash == 0.) {
        discard;
      }
    }

    gl_FragColor = vec4(color, opacity);
    ${THREE.ShaderChunk.fog_fragment}
}`;
//# sourceMappingURL=meshline.glsl.js.map