import * as THREE from "three/webgpu";
import {
  vec4,
  attribute,
  Fn,
  cameraProjectionMatrix,
  modelViewMatrix,
  // viewportCoordinate,
  // viewportSize,
  ShaderNodeObject,
  normalize,
  float,
  vec2,
  vec3,
  varying,
  floor,
  select,
  varyingProperty,
  If,
  equals,
  mat4,
} from "three/tsl";
import MeshLineGeometry from "./MeshLine/MeshLineGeometry.js";
import OperatorNode from "three/src/nodes/math/OperatorNode.js";
import TestGeometry from "./TestGeometry.js";

export default class WebGPULine extends THREE.Mesh {
  constructor(start: THREE.Vector3, end: THREE.Vector3) {
    const testGeometry = new THREE.BufferGeometry();
    // prettier-ignore
    testGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          0, 1, 0,
          0, 0, 0,
          1, 0, 0,
          1, 1, 0,
        ],
        3,
      ),
    );
    testGeometry.setIndex(
      new THREE.Uint16BufferAttribute([0, 1, 2, 0, 2, 3], 1),
    );

    const testMaterial = new THREE.MeshBasicNodeMaterial();
    // testMaterial.positionNode = Fn(() => {
    //   return positionLocal.add(vec4(1, 0, 0, 0));
    // })();
    testMaterial.vertexNode = Fn(() => {
      const modelViewProjection = cameraProjectionMatrix.mul(modelViewMatrix);
      const position = attribute("position").add(vec4(1, 0, 0, 0));

      const start = modelViewProjection.mul(
        vec4(position.x, position.y, position.z, 1),
      );

      return start;
    })();
    testMaterial.colorNode = vec4(1.0, 0.0, 1.0, 1.0);

    // super(testGeometry, testMaterial);

    const geometry = new MeshLineGeometry();
    geometry.setPoints([
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(2, 1, 0),
    ]);

    const vertexArray = [];
    for (let i = 0; i < geometry.attributes.position?.count; i++) {
      const vertexData = {};
      for (let key of Object.keys(geometry.attributes)) {
        vertexData[key] = [];
        for (let j = 0; j < geometry.attributes[key]?.itemSize; j++) {
          const index = i * geometry.attributes[key]?.itemSize + j;
          vertexData[key].push(geometry.attributes[key]?.array[index]);
          // console.log(`geometry[${key}][${index}] == ${geometry.attributes[key]?.array[index]}`);
          // if (geometry2.attributes[key].array[index] !== geometry.attributes[key]?.array[index]) {
          //   console.error("rip");
          // }
        }
      }
      vertexArray.push(vertexData);
    }
    // console.log(geometry.index?.array);
    // for (let i = 0; i < vertexArray.length; i++) {
    //   console.log(i);
    //   console.table(vertexArray[i]);
    // }
    // console.log(geometry.attributes);

    const material = new THREE.MeshBasicNodeMaterial();
    const viewportSize = vec2(1280, 720);
    const viewportCoordinate = vec2(8, 8);
    const lineWidth = 0.3;

    // NOTE: https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Perspective_divide:~:text=defined%20clipping%20region.-,Perspective%20divide,-%5Bedit%5D
    const perspectiveDivide = Fn(
      ([clipSpaceVertex]: [ShaderNodeObject<OperatorNode>]) => {
        return clipSpaceVertex.xyz.div(clipSpaceVertex.w);
      },
    );

    // NOTE: https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Perspective_divide:~:text=)-,Viewport%20transform,-%5Bedit%5D
    const viewportTransform = Fn(
      ([normalizedDeviceCoordinates]: [ShaderNodeObject<OperatorNode>]) =>
        // TODO: Read this programmatically.
        normalizedDeviceCoordinates
          .mul(viewportSize.div(2))
          .add(viewportCoordinate)
          .add(viewportSize.div(2)),
    );

    const clipToFragment = Fn(
      ([clipSpaceVertex]: [ShaderNodeObject<OperatorNode>]) =>
        viewportTransform(perspectiveDivide(clipSpaceVertex)),
    );

    const boolToSign = Fn(([booleanValue]: [ShaderNodeObject<OperatorNode>]) =>
      float(2).mul(booleanValue.oneMinus()).sub(1),
    );

    const vertexNode = Fn(() => {
      let vColor = vec4(1, 0, 0, 1);
      varyingProperty("vec4", "vColor").assign(vColor);

      const modelViewProjection = cameraProjectionMatrix.mul(modelViewMatrix);
      const pointMatrix = modelViewProjection.mul(
        mat4(
          vec4(attribute("position"), 1),
          vec4(attribute("endPosition"), 1),
          vec4(attribute("nextPosition"), 1),
          vec4(attribute("previousPosition"), 1),
        ),
      );

      const start = vec4(pointMatrix[0]);
      const end = vec4(pointMatrix[1]);
      const next = vec4(pointMatrix[2]);
      const previous = vec4(pointMatrix[3]);

      const isStart = attribute("start");
      const isBottom = attribute("bottom");

      const startFragment = clipToFragment(start);
      const endFragment = clipToFragment(end);
      const nextFragment = clipToFragment(next);
      const previousFragment = clipToFragment(previous);

      const screenSpaceSegmentVec = normalize(endFragment.sub(startFragment));
      const screenSpaceSegmentNormal = vec2(
        screenSpaceSegmentVec.y.negate(),
        screenSpaceSegmentVec.x,
      );

      const fragmentOffset = screenSpaceSegmentVec
        .mul(boolToSign(isStart))
        .add(screenSpaceSegmentNormal.mul(boolToSign(isBottom)))
        .mul(lineWidth);

      const glPosition = select(isStart.equal(float(1)), start, end).toVar();
      const clipSpaceFragmentOffset = cameraProjectionMatrix.mul(
        vec4(fragmentOffset.xy, 0, 1),
      ).xy;
      glPosition.xy.addAssign(clipSpaceFragmentOffset);
      return vec4(glPosition.xyz, 1);
    });

    material.vertexNode = vertexNode();
    material.fragmentNode = varyingProperty("vec4", "vColor");

    super(geometry, material);
  }
}
