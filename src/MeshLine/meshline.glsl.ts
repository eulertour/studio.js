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
    float textureDivide = textureCoords / 2.;
    float startEnd = 2. * (ceil(floor(textureDivide)) - 0.5);
    float bottomTop = 2. * (ceil(fract(textureDivide)) - 0.5);
    segmentVec *= startEnd;
    segmentNormal *= bottomTop;

    vec2 fragmentOffset = 0.5 * unitWidth * (segmentVec + segmentNormal);
    vec2 offset = (projectionMatrix * vec4(fragmentOffset, 0., 1.)).xy;

    gl_Position = start * eq(startEnd, -1.) + end * eq(startEnd, 1.);
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

    bool hasNext = vNextFragment != vEndFragment;
    if (hasNext && segmentCoversFragment(gl_FragCoord.xy, vEndFragment, vNextFragment)) discard;
    if (!segmentCoversFragment(gl_FragCoord.xy, vStartFragment, vEndFragment)) discard;
    if (vProportion < drawRange[0] || drawRange[1] < vProportion) discard;
    gl_FragColor = vec4(color, opacity);

    ${ShaderChunk.fog_fragment}
	}
`;
