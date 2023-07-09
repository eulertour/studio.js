import * as THREE from "three";
import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import { GeometryResolution } from "./geometry";

export class LineGeometry extends BufferGeometry {
  constructor(startVec: THREE.Vector3, endVec: THREE.Vector3) {
    super();

    const startArray = startVec.toArray();
    const endArray = endVec.toArray();

    let position = [];
    let oppositePosition = [];
    let side = [];
    let startEnd = [];

    position.push(...startArray);
    oppositePosition.push(...endArray);
    side.push(+1);
    startEnd.push(+1);

    position.push(...startArray);
    oppositePosition.push(...endArray);
    side.push(-1);
    startEnd.push(-1);

    position.push(...startArray);
    oppositePosition.push(...endArray);
    side.push(+1);
    startEnd.push(-1);

    position.push(...startArray);
    oppositePosition.push(...endArray);
    side.push(-1);
    startEnd.push(+1);

    let indices = [0, 1, 2, 2, 3, 0];

    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(position, 3)
    );
    this.setAttribute(
      "oppositePosition",
      new THREE.Float32BufferAttribute(oppositePosition, 3)
    );
    this.setAttribute("side", new THREE.Float32BufferAttribute(side, 1));
    this.setAttribute(
      "startEnd",
      new THREE.Float32BufferAttribute(startEnd, 1)
    );
    this.setIndex(indices);
  }
}

const material = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Vector3(0.0, 0.0, 1.0) },
    resolution: { value: GeometryResolution },
    devicePixelRatio: { value: window.devicePixelRatio },
  },
  vertexShader: `
precision mediump float;
precision mediump int;

// Passed by WebGLProgram
// https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform vec2 resolution;
uniform float devicePixelRatio;

// attribute vec3 position;
attribute vec3 oppositePosition;
attribute float side;
attribute float startEnd;

varying float vTest;
varying float vTest2;
varying vec2 vStartPixel;
varying vec2 vEndPixel;

// Transforms a vector in clip space to a 2D space where directions
// are equivalent to those in camera space but distances are not.
vec2 fix(vec4 v, float aspect) {
  vec2 res = v.xy / v.w;
  res.x *= aspect;
  return res;
}

vec2 pixelCoords(vec4 v) {
  vec2 perspectiveDivide = v.xy / v.w;
  vec2 viewportTransform = vec2(
    resolution.x * devicePixelRatio / 2. * (1. + perspectiveDivide.x),
    resolution.y * devicePixelRatio / 2. * (1. + perspectiveDivide.y)
  );
  return viewportTransform;
}

void main()	{
  vTest = 0.;
  
  float aspect = resolution.x / resolution.y;
  vec4 cameraStart = modelViewMatrix * vec4(position, 1.0);
  vec4 cameraEnd = modelViewMatrix * vec4(oppositePosition, 1.0);

  vec4 clipStart = projectionMatrix * cameraStart;
  vec4 clipEnd = projectionMatrix * cameraEnd;

  vStartPixel = pixelCoords(clipStart);
  vEndPixel = pixelCoords(clipEnd);

  vec2 fixedStart = fix(clipStart, aspect);
  vec2 fixedEnd = fix(clipEnd, aspect);

  vec2 vec = startEnd * normalize(fixedStart - fixedEnd);
  vec2 normal = side * vec2(-vec.y, vec.x);
  vec2 offset = normalize(vec + normal);
  
  if (
    (vec.x == -1.)
    && (vec.y == 0.)
    && (normal.x == 0.)
    && (normal.y == -1.)
    // && (offset.x == -1.)
    // && (offset.y == -1.)
    && (cameraStart.x == 0.)
    && (1151. < vStartPixel.x && vStartPixel.x < 1153.)
  ) {
    vTest = 1.;
  }
  vTest2 = 0.;
  
  vec4 cameraOffset = vec4(offset.xy, 0., 1.);
  vec4 clipOffset = projectionMatrix * cameraOffset;
  if (startEnd == 1.) {
    clipStart.xy += clipOffset.xy;
    gl_Position = clipStart;
  } else {
    clipEnd.xy += clipOffset.xy;
    gl_Position = clipEnd;
  }
}
  `,
  fragmentShader: `
precision mediump float;
precision mediump int;

uniform float time;
uniform vec3 color;
uniform vec2 resolution;
uniform float devicePixelRatio;

varying float vTest;
// varying float vTest2;
varying vec2 vStartPixel;
varying vec2 vEndPixel;

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

void main()	{
  float red = 0.;
  float blue = 0.;

  vec2 centerPixel = vec2(
    resolution.x * devicePixelRatio / 2.,
    resolution.y * devicePixelRatio / 2.
  );

  // vec2 centerToFrag = gl_FragCoord.xy - centerPixel.xy;
  // if (length(centerToFrag) > 30.) {
  //   red = 1.;
  // }

  // vec2 startToFrag = gl_FragCoord.xy - vStartPixel;
  // if (length(startToFrag) < 30.) {
  //   discard;
  // }

  // vec2 endToFrag = gl_FragCoord.xy - vEndPixel;
  // if (length(endToFrag) < 30.) {
  //   discard;
  // }

  // vec2 v = vEndPixel - vStartPixel;
  // vec2 u = gl_FragCoord.xy - vStartPixel;
  // vec2 vu = normalize(v);
  // vec2 p = dot(u, vu) * vu;
  // vec2 n = u - p;
  
  if (length(distanceToSegment(gl_FragCoord.xy, vStartPixel, vEndPixel)) > 30.) {
    red = 1.;
  } else {
    blue = 1.;
  }
  // if (!(0.9 < length(vu) && length(vu) < 1.1)) {
  //   discard;
  // }

  // float vTest2 = 0.0;
  // if (
  //   (vStartPixel.x < 1155.)
  //   && (160. < v.x && v.x < 165.)
  // ) {
  //   vTest2 = 1.0;
  // }

  // if (vTest != 0.) red = 1.;
  // if (vTest2 != 0.) blue = 1.;

  gl_FragColor = vec4(red, 0.0, blue, 1.0);
}
  `,
});

const mesh = new THREE.Mesh(
  new LineGeometry(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)),
  material
);

export default mesh;
