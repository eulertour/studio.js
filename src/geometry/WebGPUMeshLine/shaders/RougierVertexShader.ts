import {
  Fn,
  ShaderNodeObject,
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
import { Uniforms } from "../WebGPUMeshLineMaterial.js";
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

export class RougierVertexShader {
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
          vec4(attribute("nextPosition"), 1),
          vec4(attribute("previousPosition"), 1),
        ),
      );
      const homogeneousFirstPosition = modelViewProjection.mul(
        vec4(firstPosition, 1),
      );
      const homogeneousSecondPosition = modelViewProjection.mul(
        vec4(secondPosition, 1),
      );

      const clipSpaceStart = vec4(homogeneousLinePoints[0]);
      const clipSpaceEnd = vec4(homogeneousLinePoints[1]);
      const clipSpaceNext = vec4(homogeneousLinePoints[2]);
      const clipSpacePrevious = vec4(homogeneousLinePoints[3]);
      const clipSpaceFirstPosition = vec4(homogeneousFirstPosition);
      const clipSpaceSecondPosition = vec4(homogeneousSecondPosition);

      const screenSpaceStartFragment = clipToScreenSpace(clipSpaceStart);
      const screenSpaceEndFragment = clipToScreenSpace(clipSpaceEnd);
      const screenSpaceNextFragment = clipToScreenSpace(clipSpaceNext);
      const screenSpacePreviousFragment = clipToScreenSpace(clipSpacePrevious);
      const screenSpaceFirstPosition = clipToScreenSpace(clipSpaceFirstPosition);
      const screenSpaceSecondPosition = clipToScreenSpace(clipSpaceSecondPosition);

      varyingProperty("vec2", "vStartFragment").assign(screenSpaceStartFragment);
      varyingProperty("vec2", "vEndFragment").assign(screenSpaceEndFragment);
      varyingProperty("vec2", "vNextFragment").assign(screenSpaceNextFragment);
      varyingProperty("vec2", "vPreviousFragment").assign(
        screenSpacePreviousFragment,
      );
      varyingProperty("vec2", "vFirstFragment").assign(screenSpaceFirstPosition);
      varyingProperty("vec2", "vSecondFragment").assign(screenSpaceSecondPosition);

      const screenSpaceSegmentUnitVector = normalize(
        screenSpaceEndFragment.sub(screenSpaceStartFragment),
      );
      const screenSpaceSegmentUnitNormal = vec2(
        screenSpaceSegmentUnitVector.y.negate(),
        screenSpaceSegmentUnitVector.x,
      );

      const isStart = attribute("start");
      const isBottom = attribute("bottom");

      // NOTE: This is the vector offset from the start or end of the current
      // segment to a corner of the polygon representing it. It's represented
      // by the diagonal lines in the diagram below. The components parallel
      // and normal to the segment vector are equal and each have length 1.
      // Accordingly, the legnth of this vector is sqrt(2).
      // +-------------------+
      // |\                 /|
      // | +---------------+ |
      // |/                 \|
      // +-------------------+
      const screenSpaceUnitVertexOffset = screenSpaceSegmentUnitVector
        .mul(boolToSign(isStart))
        .add(screenSpaceSegmentUnitNormal.mul(boolToSign(isBottom)));
      const cameraSpaceFragmentOffset = vec4(
        screenSpaceUnitVertexOffset.mul(strokeWidth).mul(UNITS_PER_STROKE_WIDTH)
          .xy,
        0,
        0,
      );
      const clipSpaceFragmentOffset = cameraProjectionMatrix.mul(
        cameraSpaceFragmentOffset,
      );
      const clipSpaceVertex = select(isStart, clipSpaceStart, clipSpaceEnd).add(
        clipSpaceFragmentOffset,
      );
      return clipSpaceVertex;
    });
  }
}