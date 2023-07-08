import * as THREE from "three";
import { BufferAttribute, BufferGeometry, Vector3 } from "three";

export class LineGeometry extends BufferGeometry {
  constructor(startVec: THREE.Vector3, endVec: THREE.Vector3) {
    super();

    let vertices = [-1, -1, 0, +1, -1, 0, +1, +1, 0, -1, +1, 0];
    let normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    let indices = [0, 1, 2, 2, 3, 0];

    const startArray = startVec.toArray();
    let start = [...startArray, ...startArray, ...startArray, ...startArray];

    const endArray = endVec.toArray();
    let end = [...endArray, ...endArray, ...endArray, ...endArray];

    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute("start", new THREE.Float32BufferAttribute(start, 3));
    this.setAttribute("end", new THREE.Float32BufferAttribute(end, 3));
    this.setIndex(indices);

    // let vertices = [-1, -1, 0, +1, -1, 0, +1, +1, 0, -1, +1, 0];
    // let normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    // let indices = [0, 1, 2, 2, 3, 0];

    // const startArray = startVec.toArray();
    // let start = [...startArray, ...startArray, ...startArray, ...startArray];

    // const endArray = endVec.toArray();
    // let end = [...endArray, ...endArray, ...endArray, ...endArray];

    // let positions = [...startArray, ...startArray, ...endArray, ...endArray];

    // let others = [...endArray, ...endArray, ...startArray, ...startArray];

    // let sides = [+1, -1, +1, -1];

    // this.setAttribute(
    //   "position",
    //   new THREE.Float32BufferAttribute(positions, 3)
    // );
    // this.setAttribute("other", new THREE.Float32BufferAttribute(others, 3));
    // this.setAttribute("side", new THREE.Float32BufferAttribute(sides, 1));
    // this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    // this.setIndex(indices);
  }
}

const material = new THREE.ShaderMaterial({
  vertexShader: `
precision mediump float;
precision mediump int;

// Passed by WebGLProgram
// https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;

// attribute vec3 position;

varying vec3 vPosition;

void main()	{

  vPosition = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
  `,
  fragmentShader: `
precision mediump float;
precision mediump int;

uniform float time;

varying vec3 vPosition;

void main()	{

  vec4 color = vec4( 1.0, 0.0, 0.0, 1.0 );
  gl_FragColor = color;
}
  `,
});

const mesh = new THREE.Mesh(
  new LineGeometry(new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)),
  material
);

export default mesh;
