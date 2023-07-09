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

    position.push(...startArray);
    oppositePosition.push(...endArray);
    side.push(+1);

    position.push(...endArray);
    oppositePosition.push(...startArray);
    side.push(-1);

    position.push(...endArray);
    oppositePosition.push(...startArray);
    side.push(+1);

    position.push(...startArray);
    oppositePosition.push(...endArray);
    side.push(-1);

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
    this.setIndex(indices);
  }
}

const material = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Vector3(0.0, 0.0, 1.0) },
    resolution: { value: GeometryResolution },
  },
  vertexShader: `
precision mediump float;
precision mediump int;

// Passed by WebGLProgram
// https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform vec2 resolution;

// attribute vec3 position;
attribute vec3 oppositePosition;
attribute float side;

varying vec3 vPosition;
varying float vTest;
varying vec2 vStartPixel;
varying vec2 vEndPixel;

// Transforms a vector in clip space to a 2D space where directions
// are equivalent to those in camera space but distances are not.
vec2 fix(vec4 v, float aspect) {
  vec2 res = v.xy / v.w;
  res.x *= aspect;
  return res;
}

vec2 pixelCoords(vec4 v, vec2 resolution) {
  vec2 perspectiveDivide = v.xy / v.w;
  vec2 viewportTransform = vec2(
    resolution.x / 2. * (1. + perspectiveDivide.x),
    resolution.y / 2. * (1. + perspectiveDivide.y)
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

  vStartPixel = pixelCoords(clipStart, resolution);
  vEndPixel = pixelCoords(clipEnd, resolution);

  vec2 fixedStart = fix(clipStart, aspect);
  vec2 fixedEnd = fix(clipEnd, aspect);

  vec2 vec = normalize(fixedStart - fixedEnd);
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
    && (635. < vStartPixel.x && vStartPixel.x < 645.)
  ) {
    vTest = 1.;
  }
  
  vec4 cameraOffset = vec4(offset.xy, 0., 1.);
  vec4 clipOffset = projectionMatrix * cameraOffset;
  clipStart.xy += clipOffset.xy;
  gl_Position = clipStart;
}
  `,
  fragmentShader: `
precision mediump float;
precision mediump int;

uniform float time;
uniform vec3 color;
uniform vec2 resolution;

varying float vTest;

void main()	{
  vec2 center = vec2(
    resolution.x / 2.,
    resolution.y / 2.
  );
  vec2 centerToFrag = gl_FragCoord.xy - center.xy;
  if (length(centerToFrag) > 100.) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  } else {
    discard;
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
  }
}
  `,
});

const mesh = new THREE.Mesh(
  new LineGeometry(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)),
  material
);

export default mesh;
