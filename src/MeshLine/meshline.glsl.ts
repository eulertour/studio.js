import { ShaderChunk } from "three";

ShaderChunk["eulertour_meshline_vert"] = /*glsl*/ `
  ${ShaderChunk.logdepthbuf_pars_vertex}
  ${ShaderChunk.fog_pars_vertex}

  precision lowp int;

  // Passed by WebGLProgram
  // https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram
  // uniform mat4 modelViewMatrix;
  // uniform mat4 projectionMatrix;
  uniform vec2 resolution;
  uniform float unitsPerPixel;
  uniform float pixelWidth;

  // Passed by WebGLProgram
  // https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram
  // attribute vec3 position;
  attribute vec3 endPosition;
  attribute vec3 nextPosition;
  attribute int textureCoords;

  varying vec2 vStartFragment;
  varying vec2 vEndFragment;
  varying vec2 vNextFragment;

  vec2 fragmentCoords(vec4 v) {
    return resolution / 2. * (1. + v.xy / v.w);
  }

  void main()	{
    mat4 modelViewProjection = projectionMatrix * modelViewMatrix;
    vec4 start = modelViewProjection * vec4(position, 1.0);
    vec4 end = modelViewProjection * vec4(endPosition, 1.0);
    vec4 next = modelViewProjection * vec4(nextPosition, 1.0);

    vStartFragment = fragmentCoords(start);
    vEndFragment = fragmentCoords(end);
    vNextFragment = fragmentCoords(next);

    vec2 segmentVec = normalize(vEndFragment - vStartFragment);
    vec2 segmentNormal = vec2(-segmentVec.y, segmentVec.x);
    float startEnd = 2. * (float(textureCoords / 2) - 0.5);
    float bottomTop = 2. * (float(textureCoords % 2) - 0.5);
    segmentVec *= startEnd;
    segmentNormal *= bottomTop;

    vec2 fragmentOffset = 0.5 * pixelWidth * unitsPerPixel * (segmentVec + segmentNormal);
    vec2 offset = (projectionMatrix * vec4(fragmentOffset, 0., 1.)).xy;

    gl_Position = startEnd == -1. ? start : end;
    gl_Position.xy += offset;

    ${ShaderChunk.logdepthbuf_vertex}
    ${
      ShaderChunk.fog_vertex &&
      /*glsl*/ `vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );`
    }
    ${ShaderChunk.fog_vertex}
	}
`;

ShaderChunk["eulertour_meshline_frag"] = /*glsl*/ `
  ${ShaderChunk.fog_pars_fragment}
  ${ShaderChunk.logdepthbuf_pars_fragment}

  uniform vec3 color;
  uniform vec2 resolution;
  uniform float pixelWidth;

  varying vec2 vStartFragment;
  varying vec2 vEndFragment;
  varying vec2 vNextFragment;

  float distanceToSegment(
    vec2 fragment,
    vec2 startFragment,
    vec2 endFragment
  ) {
    vec2 segmentVec = endFragment - startFragment;
    vec2 fragmentVec = fragment - startFragment;
    float dotProduct = dot(fragmentVec, segmentVec);
    vec2 segmentProjection = dotProduct / dot(segmentVec, segmentVec) * segmentVec;

    vec2 normal = fragmentVec - segmentProjection;
    vec2 tangent = fragmentVec - normal;

    if (dotProduct > 0.) {
      if (dot(segmentVec, segmentVec) < dot(tangent, tangent)) {
        tangent -= segmentVec;
      } else {
        tangent *= 0.;
      }
    }

    return length(tangent + normal);
  }

  float distanceToFragment(vec2 u, vec2 v) {
    return length(u - v);
  }

  void main() {
    ${ShaderChunk.logdepthbuf_fragment}

    float halfWidth = 0.5 * pixelWidth;
    vec2 nextVec = normalize(vNextFragment - vEndFragment);
    if (vNextFragment != vEndFragment) {
      vec2 endToFrag = gl_FragCoord.xy - vEndFragment;
      float d = dot(endToFrag, nextVec);
      if (d > 0.) {
        vec2 nextProjection = d / dot(nextVec, nextVec) * nextVec;
        vec2 nextNormal = endToFrag - nextProjection;
        if (length(nextProjection) < length(vNextFragment - vEndFragment) && length(nextNormal) < halfWidth) {
          discard;
        } else if (distanceToFragment(gl_FragCoord.xy, vNextFragment) < halfWidth) {
          discard;
        }
      } else if (distanceToFragment(gl_FragCoord.xy, vEndFragment) < halfWidth) {
        discard;
      }
    }

    if (distanceToSegment(gl_FragCoord.xy, vStartFragment, vEndFragment) > halfWidth) {
      discard;
    } else {
      gl_FragColor = vec4(0., 0., 0., 1.);
    }

    ${ShaderChunk.fog_fragment}
	}
`;
