import {
  Fn,
  ShaderNodeObject,
  add,
  attribute,
  cameraProjectionMatrix,
  float,
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

const boolToSign = Fn(([booleanValue]: [ShaderNodeObject<OperatorNode>]) =>
  float(2).mul(booleanValue.oneMinus()).sub(1),
);

export default class RougierVertexShader {
  node: ShaderNodeFn<[]>;

  constructor(
    firstPosition: UniformNode<Vector3>,
    secondPosition: UniformNode<Vector3>,
    strokeWidth: UniformNode<number>,
  ) {
    this.node = Fn(() => {
      const modelViewProjection = cameraProjectionMatrix.mul(modelViewMatrix);
      const homogeneousLinePoints = modelViewProjection.mul(
        mat4(
          vec4(attribute("position"), 1),
          vec4(attribute("endPosition"), 1),
          vec4(attribute("previousPosition"), 1),
          vec4(0, 0, 0, 0),
        ),
      );
      const homogeneousFirstSegment = modelViewProjection.mul(
        mat4(
          vec4(firstPosition, 1),
          vec4(secondPosition, 1),
          vec4(0, 0, 0, 0),
          vec4(0, 0, 0, 0),
        ),
      );

      const clipSpaceStart = vec4(homogeneousLinePoints[0]);
      const clipSpaceEnd = vec4(homogeneousLinePoints[1]);
      const clipSpacePrevious = vec4(homogeneousLinePoints[2]);
      const clipSpaceFirstPosition = vec4(homogeneousFirstSegment[0]);
      const clipSpaceSecondPosition = vec4(homogeneousFirstSegment[1]);

      const screenSpaceStartFragment = clipToScreenSpace(clipSpaceStart);
      const screenSpaceEndFragment = clipToScreenSpace(clipSpaceEnd);
      const screenSpacePreviousFragment = clipToScreenSpace(clipSpacePrevious);
      const screenSpaceFirstFragment = clipToScreenSpace(
        clipSpaceFirstPosition,
      );
      const screenSpaceSecondFragment = clipToScreenSpace(
        clipSpaceSecondPosition,
      );

      varyingProperty("vec2", "vStartFragment").assign(
        screenSpaceStartFragment,
      );
      varyingProperty("vec2", "vEndFragment").assign(screenSpaceEndFragment);
      varyingProperty("vec2", "vPreviousFragment").assign(
        screenSpacePreviousFragment,
      );
      varyingProperty("vec2", "vFirstFragment").assign(
        screenSpaceFirstFragment,
      );
      varyingProperty("vec2", "vSecondFragment").assign(
        screenSpaceSecondFragment,
      );

      const screenSpaceUnitTangent = normalize(
        screenSpaceEndFragment.sub(screenSpaceStartFragment),
      );
      const screenSpaceUnitNormal = vec2(
        screenSpaceUnitTangent.y.negate(),
        screenSpaceUnitTangent.x,
      );

      const isStart = attribute("isStart");
      const isBottom = attribute("isBottom");

      // NOTE: This is the vector offset from the start or end of the current
      // segment to a corner of the polygon containing it. It's represented
      // by the diagonal lines in the diagram below. The components parallel
      // and normal to the tangent vector are equal and each have length 1.
      // The length of the vector is sqrt(2).
      // +-------------------+
      // |\                 /|
      // | +---------------+ |
      // |/                 \|
      // +-------------------+
      const screenSpaceUnitOffset = add(
        screenSpaceUnitTangent.mul(boolToSign(isStart)),
        screenSpaceUnitNormal.mul(boolToSign(isBottom)),
      );
      const cameraSpaceVertexOffset = vec4(
        screenSpaceUnitOffset.mul(strokeWidth).mul(UNITS_PER_STROKE_WIDTH),
        0,
        0,
      );
      const clipSpaceVertexOffset = cameraProjectionMatrix.mul(
        cameraSpaceVertexOffset,
      );

      return add(
        select(isStart, clipSpaceStart, clipSpaceEnd),
        clipSpaceVertexOffset,
      );
    });
  }
}
