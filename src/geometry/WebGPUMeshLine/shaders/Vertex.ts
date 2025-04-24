import {
  Fn,
  If,
  ShaderNodeObject,
  attribute,
  cameraProjectionMatrix,
  cameraWorldMatrix,
  distance,
  mat2,
  mat4,
  modelViewMatrix,
  normalize,
  screenSize,
  select,
  varyingProperty,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import { ShaderNodeFn } from "three/src/nodes/TSL.js";
import OperatorNode from "three/src/nodes/math/OperatorNode.js";
import { UNITS_PER_STROKE_WIDTH } from "../../../constants.js";
import { UniformNode } from "three/webgpu";
import { Vector3 } from "three";

const SQRT_2 = 1.4142135624;
const ARROW_WIDTH = 1;
const ARROW_LENGTH = 1;

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

const projectOntoVector = Fn(
  ([vectorToProject, vectorToProjectOnto]: [
    ShaderNodeObject<OperatorNode>,
    ShaderNodeObject<OperatorNode>,
  ]) => {
    const projectionUnitVector = vectorToProjectOnto.normalize();
    return vectorToProject.dot(projectionUnitVector).mul(projectionUnitVector);
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
    arrowSegmentStart: UniformNode<Vector3>,
    arrowSegmentEnd: UniformNode<Vector3>,
    arrowSegmentProportion: UniformNode<number>,
  ) {
    this.node = Fn(() => {
      const cameraWorldMatrixZColumn = cameraWorldMatrix[2];
      if (cameraWorldMatrixZColumn === undefined) {
        throw new Error("Camera z column is undefined");
      }
      const cameraPlaneUnitNormal = cameraWorldMatrixZColumn.xyz
        .negate()
        .normalize();

      const arrowSegmentVector = vec3(arrowSegmentEnd).sub(arrowSegmentStart);
      const arrowSegmentProjectionToCameraPlane = arrowSegmentVector.sub(
        projectOntoVector(arrowSegmentVector, cameraPlaneUnitNormal),
      );
      const arrowTailUnitOffset = arrowSegmentProjectionToCameraPlane
        .cross(cameraPlaneUnitNormal)
        .normalize();

      const arrowTipPosition = vec3(arrowSegmentStart).add(
        arrowSegmentVector.mul(arrowSegmentProportion),
      );
      const arrowTailPosition = arrowTipPosition
        .add(arrowTailUnitOffset.mul(ARROW_WIDTH))
        .add(arrowSegmentVector.negate().normalize().mul(ARROW_LENGTH));

      const modelViewProjection = cameraProjectionMatrix.mul(modelViewMatrix);
      const clipSpaceLinePoints = modelViewProjection.mul(
        mat4(
          vec4(attribute("position"), 1),
          vec4(attribute("endPosition"), 1),
          vec4(attribute("prevPosition"), 1),
          vec4(attribute("nextPosition"), 1),
        ),
      );
      const clipSpaceSegments = modelViewProjection.mul(
        mat4(
          vec4(firstPosition, 1),
          vec4(secondPosition, 1),
          vec4(arrowTipPosition, 1),
          vec4(arrowTailPosition, 1),
        ),
      );

      const clipSpaceStart = vec4(clipSpaceLinePoints[0]);
      const clipSpaceEnd = vec4(clipSpaceLinePoints[1]);
      const clipSpacePrevious = vec4(clipSpaceLinePoints[2]);
      const clipSpaceNext = vec4(clipSpaceLinePoints[3]);
      const clipSpaceFirstPosition = vec4(clipSpaceSegments[0]);
      const clipSpaceSecondPosition = vec4(clipSpaceSegments[1]);
      const clipSpaceArrowTip = vec4(clipSpaceSegments[2]);
      const clipSpaceArrowTail = vec4(clipSpaceSegments[3]);

      const startFragment = clipToScreenSpace(clipSpaceStart);
      const endFragment = clipToScreenSpace(clipSpaceEnd);
      const previousFragment = clipToScreenSpace(clipSpacePrevious);
      const nextFragment = clipToScreenSpace(clipSpaceNext);
      const firstFragment = clipToScreenSpace(clipSpaceFirstPosition);
      const secondFragment = clipToScreenSpace(clipSpaceSecondPosition);
      const arrowTipFragment = clipToScreenSpace(clipSpaceArrowTip);
      const arrowTailFragment = clipToScreenSpace(clipSpaceArrowTail);

      // NOTE: This is the vector offset from the start or end of the
      // current segment to a corner of the quadrilateral containing
      // it (scaled by 2 for segments that compose an arrow). It's
      // represented by the diagonal lines in the diagram below. The
      // components tangent and normal to the segment vector are equal
      // and each have length 1 (or 2). The length of the vector is
      // sqrt(2).
      // *-------------------*
      // |\                 /|
      // | *---------------* |
      // |/                 \|
      // *-------------------*
      const rawVertexOffset = attribute("vertexOffset");
      const isArrowSegment = rawVertexOffset.lengthSq().greaterThan(2);

      varyingProperty("vec2", "vStartFragment").assign(
        select(isArrowSegment, arrowTipFragment, startFragment),
      );
      varyingProperty("vec2", "vEndFragment").assign(
        select(isArrowSegment, arrowTailFragment, endFragment),
      );
      varyingProperty("vec2", "vPreviousFragment").assign(previousFragment);
      varyingProperty("vec2", "vNextFragment").assign(nextFragment);
      varyingProperty("vec2", "vFirstFragment").assign(firstFragment);
      varyingProperty("vec2", "vSecondFragment").assign(secondFragment);
      varyingProperty("float", "vFirstSegmentLength").assign(
        distance(firstPosition, secondPosition),
      );
      varyingProperty("float", "vIsArrowSegment").assign(isArrowSegment);
      varyingProperty("float", "vArrowSegmentLength").assign(
        arrowTipPosition.distance(arrowTailPosition),
      );
      varyingProperty("vec2", "vArrowTipFragment").assign(arrowTipFragment);
      varyingProperty("vec2", "vArrowTailFragment").assign(arrowTailFragment);

      const tangent = select(
        isArrowSegment,
        arrowTailFragment.sub(arrowTipFragment),
        endFragment.sub(startFragment),
      );
      const unitTangent = normalize(tangent);
      const unitNormal = rotate90(unitTangent);
      varyingProperty("vec4", "vTestColor").assign(vec4(1, 0, 0, 1));

      If(isArrowSegment, () => {
        varyingProperty("vec4", "vTestColor").assign(vec4(0, 0, 1, 1));
      });

      const vertexOffset = rawVertexOffset.normalize().mul(SQRT_2);
      const unitOffset = mat2(unitTangent, unitNormal).mul(vertexOffset);
      const cameraSpaceVertexOffset = vec4(
        unitOffset.mul(width).mul(UNITS_PER_STROKE_WIDTH),
        0,
        0,
      );
      const clipSpaceVertexOffset = cameraProjectionMatrix.mul(
        cameraSpaceVertexOffset,
      );

      const linePointVertex = select(
        isArrowSegment,
        select(
          vertexOffset.x.lessThan(0),
          clipSpaceArrowTip,
          clipSpaceArrowTail,
        ),
        select(vertexOffset.x.lessThan(0), clipSpaceStart, clipSpaceEnd),
      );
      return linePointVertex.add(clipSpaceVertexOffset);
    });
  }
}
