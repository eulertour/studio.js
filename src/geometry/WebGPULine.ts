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

    const clipToFragment = Fn(
      ([clipSpaceVertex]: [ShaderNodeObject<OperatorNode>]) => {
        const viewportSize = vec2(1280, 720);
        const normalizedDeviceCoordinateVertex = clipSpaceVertex.xyz.div(
          clipSpaceVertex.w,
        );
        const screenSpaceVertex = normalizedDeviceCoordinateVertex
          .mul(viewportSize.div(2))
          // .add(viewportCoordinate)
          .add(viewportSize.div(2));
        return screenSpaceVertex.xy;
      },
    );

    const vertexNode = Fn(() => {
      let vColor = vec4(1, 0, 0, 1);
      varyingProperty("vec4", "vColor").assign(vColor);

      const modelViewProjection = cameraProjectionMatrix.mul(modelViewMatrix);

      const position = attribute("position");
      const endPosition = attribute("endPosition");
      const nextPosition = attribute("nextPosition");
      const previousPosition = attribute("previousPosition");

      const start = modelViewProjection.mul(
        vec4(position.x, position.y, position.z, 1),
      );
      const end = modelViewProjection.mul(
        vec4(endPosition.x, endPosition.y, endPosition.z, 1),
      );
      const next = modelViewProjection.mul(
        vec4(nextPosition.x, nextPosition.y, nextPosition.z, 1),
      );
      const previous = modelViewProjection.mul(
        vec4(previousPosition.x, previousPosition.y, previousPosition.z, 1),
      );

      // let remaining = attribute("textureCoords");
      // const beforeArrow = floor(float(0.125).mul(remaining));
      // remaining.sub(float(8).mul(beforeArrow));
      // const arrow = floor(float(0.25).mul(remaining));
      // remaining.sub(float(4).mul(arrow));
      // const startEnd = floor(float(0.5).mul(remaining));
      // remaining.sub(float(2).mul(startEnd));
      // const bottomTop = remaining;

      const isStart = attribute("start");
      const isBottom = attribute("bottom");

      const startFragment = clipToFragment(start);
      const endFragment = clipToFragment(end);
      const nextFragment = clipToFragment(next);
      const previousFragment = clipToFragment(previous);

      const segmentVec = normalize(endFragment.sub(startFragment));
      const segmentNormal = vec2(segmentVec.y.negate(), segmentVec.x);

      const transformedSegmentVec = segmentVec.mul(
        float(2).mul(isStart.oneMinus()).sub(1),
      );
      const transformedSegmentNormal = segmentNormal.mul(
        float(2).mul(isBottom.oneMinus()).sub(1),
      );

      const fragmentOffset = transformedSegmentVec.add(
        transformedSegmentNormal,
      );

      const glPosition = select(isStart.equal(float(1)), start, end).toVar();
      const clipSpaceFragmentOffset = cameraProjectionMatrix.mul(
        vec4(fragmentOffset.x, fragmentOffset.y, 0, 1),
      ).xy;

      glPosition.xy.addAssign(clipSpaceFragmentOffset);

      return vec4(glPosition.x, glPosition.y, glPosition.z, 1);
    });

    material.vertexNode = vertexNode();
    material.colorNode = varyingProperty("vec4", "vColor");

    super(geometry, material);
  }
}
