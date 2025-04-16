import {
  Fn,
  ShaderNodeObject,
  attribute,
  cameraProjectionMatrix,
  distance,
  mat2,
  mat4,
  modelViewMatrix,
  normalize,
  screenSize,
  select,
  varyingProperty,
  vec2,
  vec4,
} from "three/tsl";
import { ShaderNodeFn } from "three/src/nodes/TSL.js";
import OperatorNode from "three/src/nodes/math/OperatorNode.js";
import { UNITS_PER_STROKE_WIDTH } from "../../../constants.js";
import { UniformNode } from "three/webgpu";
import { Vector3 } from "three";

// NOTE: https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Perspective_divide:~:text=defined%20clipping%20region.-,Perspective%20divide,-%5Bedit%5D
const perspectiveDivide = Fn(
  ([clipSpaceVertex]: [ShaderNodeObject<OperatorNode>]) =>
    clipSpaceVertex.xyz.div(clipSpaceVertex.w),
);

// NOTE: https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Perspective_divide:~:text=)-,Viewport%20transform,-%5Bedit%5D
const viewportTransform = Fn(
  ([normalizedDeviceCoordinates]: [ShaderNodeObject<OperatorNode>]) =>
    normalizedDeviceCoordinates.mul(screenSize.div(2)).add(screenSize.div(2))
      .xy,
);

const clipToScreenSpace = Fn(
  ([clipSpaceVertex]: [ShaderNodeObject<OperatorNode>]) => {
    const normalizedDeviceCoordinate = perspectiveDivide(clipSpaceVertex);
    const screenSpaceFragment = viewportTransform(normalizedDeviceCoordinate);
    return screenSpaceFragment;
  },
);

const rotate90 = Fn(([vector]: [ShaderNodeObject<OperatorNode>]) =>
  vec2(vector.y.negate(), vector.x),
);

export default class VertexShader {
  node: ShaderNodeFn<[]>;

  constructor(
    width: UniformNode<number>,
    firstPosition: UniformNode<Vector3>,
    secondPosition: UniformNode<Vector3>,
  ) {
    this.node = Fn(() => {
      const modelViewProjection = cameraProjectionMatrix.mul(modelViewMatrix);
      const clipSpaceLinePoints = modelViewProjection.mul(
        mat4(
          vec4(attribute("position"), 1),
          vec4(attribute("endPosition"), 1),
          vec4(attribute("prevPosition"), 1),
          vec4(attribute("nextPosition"), 1),
        ),
      );
      const clipSpaceFirstSegment = modelViewProjection.mul(
        mat4(
          vec4(firstPosition, 1),
          vec4(secondPosition, 1),
          vec4(0, 0, 0, 0),
          vec4(0, 0, 0, 0),
        ),
      );

      const clipSpaceStart = vec4(clipSpaceLinePoints[0]);
      const clipSpaceEnd = vec4(clipSpaceLinePoints[1]);
      const clipSpacePrevious = vec4(clipSpaceLinePoints[2]);
      const clipSpaceNext = vec4(clipSpaceLinePoints[3]);
      const clipSpaceFirstPosition = vec4(clipSpaceFirstSegment[0]);
      const clipSpaceSecondPosition = vec4(clipSpaceFirstSegment[1]);

      const startFragment = clipToScreenSpace(clipSpaceStart);
      const endFragment = clipToScreenSpace(clipSpaceEnd);
      const previousFragment = clipToScreenSpace(clipSpacePrevious);
      const nextFragment = clipToScreenSpace(clipSpaceNext);
      const firstFragment = clipToScreenSpace(clipSpaceFirstPosition);
      const secondFragment = clipToScreenSpace(clipSpaceSecondPosition);

      varyingProperty("vec2", "vStartFragment").assign(startFragment);
      varyingProperty("vec2", "vEndFragment").assign(endFragment);
      varyingProperty("vec2", "vPreviousFragment").assign(previousFragment);
      varyingProperty("vec2", "vNextFragment").assign(nextFragment);
      varyingProperty("vec2", "vFirstFragment").assign(firstFragment);
      varyingProperty("vec2", "vSecondFragment").assign(secondFragment);
      varyingProperty("float", "vFirstSegmentLength").assign(
        distance(firstPosition, secondPosition),
      );

      const tangent = endFragment.sub(startFragment);
      const unitTangent = normalize(tangent);
      const unitNormal = rotate90(unitTangent);
      // NOTE: This is the vector offset from the start or end of the
      // current segment to a corner of the quadrilateral containing
      // it. It's represented by the diagonal lines in the diagram
      // below. The components tangent and normal to the segment
      // vector are equal and each have length 1. The length of the
      // vector is sqrt(2).
      // *-------------------*
      // |\                 /|
      // | *---------------* |
      // |/                 \|
      // *-------------------*
      const unitOffset = mat2(unitTangent, unitNormal).mul(
        attribute("vertexOffset"),
      );
      const cameraSpaceVertexOffset = vec4(
        unitOffset.mul(width).mul(UNITS_PER_STROKE_WIDTH),
        0,
        0,
      );
      const clipSpaceVertexOffset = cameraProjectionMatrix.mul(
        cameraSpaceVertexOffset,
      );

      return select(
        attribute("vertexOffset").x.equal(-1),
        clipSpaceStart,
        clipSpaceEnd,
      ).add(clipSpaceVertexOffset);
    });
  }
}
