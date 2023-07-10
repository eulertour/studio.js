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
attribute float startEnd;

varying vec2 vStartFragment;
varying vec2 vEndFragment;

vec2 fragmentCoords(vec4 v) {
  vec2 perspectiveDivide = v.xy / v.w;
  vec2 viewportTransform = resolution / 2. * (1. + perspectiveDivide);
  return viewportTransform;
}

void main()	{
  vec4 start = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 end = projectionMatrix * modelViewMatrix * vec4(oppositePosition, 1.0);

  vStartFragment = fragmentCoords(start);
  vEndFragment = fragmentCoords(end);

  vec2 vec = startEnd * normalize(vStartFragment - vEndFragment);
  vec2 normal = side * vec2(-vec.y, vec.x);
  vec2 offset = normalize(vec + normal);
  
  vec4 cameraOffset = vec4(offset.xy, 0., 1.);
  vec4 clipOffset = projectionMatrix * cameraOffset;

  if (startEnd == 1.) {
    start.xy += clipOffset.xy;
    gl_Position = start;
  } else {
    end.xy += clipOffset.xy;
    gl_Position = end;
  }
}
  `,
  fragmentShader: `
precision mediump float;
precision mediump int;

uniform vec3 color;
uniform vec2 resolution;

varying vec2 vStartFragment;
varying vec2 vEndFragment;

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
  if (distanceToSegment(gl_FragCoord.xy, vStartFragment, vEndFragment) > 15.) {
    discard;
  }
  gl_FragColor = vec4(0., 0., 0., 1.0);
}
  `,
});

const mesh = new THREE.Mesh(
  new LineGeometry(new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 2, 0)),
  material
);

export default mesh;
