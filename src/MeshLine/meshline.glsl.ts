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

  void main()	{
    vProportion = proportion;
    mat4 modelViewProjection = projectionMatrix * modelViewMatrix;
    vec4 start = modelViewProjection * vec4(position, 1.0);
    vec4 end = modelViewProjection * vec4(endPosition, 1.0);
    vec4 next = modelViewProjection * vec4(nextPosition, 1.0);

    vStartFragment = fragmentCoords(start);
    vEndFragment = fragmentCoords(end);
    vNextFragment = fragmentCoords(next);

    // Add 0.2 so all pixels are covered.
    vec2 segmentVec = 1.2 * normalize(vEndFragment - vStartFragment);
    vec2 segmentNormal = vec2(-segmentVec.y, segmentVec.x);

    vBeforeArrow = floor(textureCoords / 8.);
    float remaining = textureCoords - 8. * vBeforeArrow;

    vArrow = floor(remaining / 4.);
    remaining -= 4. * vArrow;

    // float textureDivide = remaining / 2.;
    // float f = fract(textureDivide);
    // float c = ceil(f);
    // c = f;
    // if (
    //   vArrow > 0.
    //   // textureCoords == 0. && f == 0. && c == 0.
    //   // textureCoords == 1. && f == 0. && c == 0.
    //   // textureCoords == 2. && f == 1. && c == 1.
    //   // textureCoords == 3. && f == 1. && c == 1.
    // ) {
    //   vFlag = 1.;
    // }

    float startEnd = floor(remaining / 2.);
    remaining -= 2. * startEnd;

    float bottomTop = remaining;

    // [0, 1] -> [1, -1]
    segmentVec *= (2. * startEnd - 1.);
    segmentNormal *= (2. * bottomTop - 1.);

    vec2 fragmentOffset
      = 0.5 * unitWidth * segmentVec
      + 0.5 * unitWidth * segmentNormal * eq(vArrow, 0.) * 1.
      + 0.5 * unitWidth * segmentNormal * eq(vArrow, 1.) * 2.618033988;
    vec2 offset = (projectionMatrix * vec4(fragmentOffset, 0., 1.)).xy;

    gl_Position = start * eq(startEnd, 0.) + end * eq(startEnd, 1.);
    gl_Position.xy += offset;

    ${ShaderChunk.logdepthbuf_vertex}
    ${
      ShaderChunk.fog_vertex &&
      /*glsl*/ `vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );`
    }
    ${ShaderChunk.fog_vertex}
	}
`;

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
  
  float lengthSquared(vec2 vec) {
    return dot(vec, vec);
  }

  bool segmentCoversFragment(vec2 fragment, vec2 startFragment, vec2 endFragment) {
    float pixelsPerUnit = viewport.w / dimensions.y;
    float pixelWidth = unitWidth * pixelsPerUnit;
    float halfWidthSquared = 0.25 * pixelWidth * pixelWidth;

    vec2 segmentVec = endFragment - startFragment;
    vec2 startToFrag = fragment - startFragment;
    vec2 endToFrag = fragment - endFragment;

    float dotProduct = dot(startToFrag, segmentVec);
    vec2 segmentProjection = dotProduct / lengthSquared(segmentVec) * segmentVec;
    vec2 segmentNormal = startToFrag - segmentProjection;

    bool towardSegment = dotProduct > 0.;

    bool segmentStem = towardSegment
      && lengthSquared(segmentProjection) < lengthSquared(segmentVec)
      && lengthSquared(segmentNormal) < halfWidthSquared;

    bool segmentStart = lengthSquared(startToFrag) < halfWidthSquared;
    bool segmentEnd = lengthSquared(endToFrag) < halfWidthSquared;

    return segmentStem || segmentStart || segmentEnd;
  }

  void main() {
    ${ShaderChunk.logdepthbuf_fragment}

    if (vArrow == 0.) {
      if (vBeforeArrow == 0.) {
        bool hasNext = vNextFragment != vEndFragment;
        if (hasNext && segmentCoversFragment(gl_FragCoord.xy, vEndFragment, vNextFragment)) discard;
      } else {
        vec2 endToNext = vNextFragment - vEndFragment;
        vec2 endToFrag = gl_FragCoord.xy - vEndFragment;
        if (dot(endToNext, endToFrag) > 0.) discard;
      }
      if (!segmentCoversFragment(gl_FragCoord.xy, vStartFragment, vEndFragment)) discard;
      if (vProportion < drawRange[0] || drawRange[1] < vProportion) discard;
      gl_FragColor = vec4(color, 0.3);
    } else {
      vec2 segmentVec = vEndFragment - vStartFragment;
      vec2 startToFrag = gl_FragCoord.xy - vStartFragment;
      float dotProduct = dot(segmentVec, startToFrag);
      vec2 segmentProjection = dotProduct / lengthSquared(segmentVec) * segmentVec;
      vec2 segmentNormal = startToFrag - segmentProjection;
      
      if (dotProduct < 0.) discard;

      // if (sqrt(lengthSquared(segmentNormal)) > 3.) discard;
      // if (sqrt(lengthSquared(segmentProjection)) > 10.) discard;

      float pixelsPerUnit = viewport.w / dimensions.y;
      // y = -width / segmentLength * x + width
      float x = sqrt(lengthSquared(segmentProjection));
      float y = sqrt(lengthSquared(segmentNormal));
      float rise = 0.5 * unitWidth * pixelsPerUnit * 2.618033988;
      float run = sqrt(lengthSquared(segmentVec));
      float m = -rise / run;
      float b = rise;

      // y = x
      // if (abs(y - x) < 2.) {

      // y = x + 10
      // if (abs(y - x - 10.) < 2.) {

      // y = -x + 10
      // if (abs(y + x - 10.) < 2.) {

      // y = -x + b
      // if (abs(y + x - b) < 2.) {

      // y = mx + b
      // if (abs(y - m * x - b) < 2.) {

      if (y > m * x + b) discard;

      gl_FragColor = vec4(color, 0.3);

      // if (lengthSquared(segmentNormal) > lengthSquared(segmentProjection)) discard;
      
    }
    // if (vFlag > 0.) {
    //   gl_FragColor = vec4(1., 0., 0., 1.);
    // } else {
    //   gl_FragColor = vec4(0., 0., 0., 0.3);
    // }

    ${ShaderChunk.fog_fragment}
	}
`;
