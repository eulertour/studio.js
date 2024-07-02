import { ShaderChunk } from "three";
export const MESHLINE_VERT = /*glsl*/ `
${ShaderChunk.logdepthbuf_pars_vertex}
${ShaderChunk.fog_pars_vertex}

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
attribute float textureCoords;
attribute float proportion;

varying vec2 vStartFragment;
varying vec2 vEndFragment;
varying vec2 vNextFragment;
varying float vProportion;
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
  vProportion = proportion;

  mat4 modelViewProjection = projectionMatrix * modelViewMatrix;
  vec4 start = modelViewProjection * vec4(position, 1.0);
  vec4 end = modelViewProjection * vec4(endPosition, 1.0);
  vec4 next = modelViewProjection * vec4(nextPosition, 1.0);

  vStartFragment = fragmentCoords(start);
  vEndFragment = fragmentCoords(end);
  vNextFragment = fragmentCoords(next);

  // Extract bools.
  float remaining = textureCoords;
  vBeforeArrow = floor(0.125 * textureCoords);
  remaining -= 8. * vBeforeArrow;
  vArrow = floor(0.25 * remaining);
  remaining -= 4. * vArrow;
  float startEnd = floor(0.5 * remaining);
  remaining -= 2. * startEnd;
  float bottomTop = remaining;

  // Add 0.2 so all pixels are covered.
  vec2 segmentVec = 1.2 * normalize(vEndFragment - vStartFragment);
  vec2 segmentNormal = vec2(-segmentVec.y, segmentVec.x);

  // [0, 1] -> [1, -1]
  segmentVec *= (2. * startEnd - 1.);
  segmentNormal *= (2. * bottomTop - 1.);

  vec2 fragmentOffset
    = 0.75 * unitWidth * segmentVec
    + 0.75 * unitWidth * segmentNormal
      * (eq(vArrow, 0.) + eq(vArrow, 1.) * 2.618033988);

  gl_Position = start * eq(startEnd, 0.) + end * eq(startEnd, 1.);
  gl_Position.xy += (projectionMatrix * vec4(fragmentOffset, 0., 1.)).xy;

  ${ShaderChunk.logdepthbuf_vertex}
  ${ShaderChunk.fog_vertex &&
    /*glsl*/ `vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );`}
  ${ShaderChunk.fog_vertex}
}`;
export const MESHLINE_FRAG = /*glsl*/ `
${ShaderChunk.fog_pars_fragment}
${ShaderChunk.logdepthbuf_pars_fragment}

uniform vec3 color;
uniform float unitWidth;
uniform float opacity;
uniform vec2 drawRange;
uniform vec4 viewport;
uniform vec4 dimensions;

varying vec2 vStartFragment;
varying vec2 vEndFragment;
varying vec2 vNextFragment;
varying float vProportion;
varying float vFlag;
varying float vArrow;
varying float vBeforeArrow;

float gt(float x, float y) { return max(sign(x - y), 0.0); }
float lt(float x, float y) { return max(sign(y - x), 0.0); }
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

void main() {
  ${ShaderChunk.logdepthbuf_fragment}

    float pixelsPerUnit = viewport.w / dimensions.y;
    float pixelWidth = unitWidth * pixelsPerUnit;
    float halfWidthSquared = 0.25 * pixelWidth * pixelWidth;
    vec2 startToFrag = gl_FragCoord.xy - vStartFragment;
    vec2 startToEnd = vEndFragment - vStartFragment;
    float startToEndDotProduct = dot(startToEnd, startToFrag);
    vec2 startToEndProjection = startToEndDotProduct / lengthSquared(startToEnd) * startToEnd;
    vec2 startToEndNormal = startToFrag - startToEndProjection;
    vec2 endToFrag = gl_FragCoord.xy - vEndFragment;
    vec2 endToNext = vNextFragment - vEndFragment;
    float endToNextDotProduct = dot(endToNext, endToFrag);
    vec2 endToNextProjection = endToNextDotProduct / lengthSquared(endToNext) * endToNext;
    vec2 endToNextNormal = endToFrag - endToNextProjection;
    vec2 nextToFrag = gl_FragCoord.xy - vNextFragment;

    // For regular segments, exclude the fragment if it is covered by the next segment.
    if (
      vBeforeArrow == 0.
      && vArrow == 0.
      && vNextFragment != vEndFragment
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
    if (vProportion < drawRange[0] || drawRange[1] < vProportion) discard;

    gl_FragColor = vec4(color, opacity);

  ${ShaderChunk.fog_fragment}
}`;
//# sourceMappingURL=meshline.glsl.js.map