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
import OperatorNode from "three/src/nodes/math/OperatorNode.js";

const lineWidth = 0.8;

// NOTE: https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Perspective_divide:~:text=defined%20clipping%20region.-,Perspective%20divide,-%5Bedit%5D
const perspectiveDivide = Fn(
  ([clipSpaceVertex]: [ShaderNodeObject<OperatorNode>]) =>
    clipSpaceVertex.xyz.div(clipSpaceVertex.w),
);

// NOTE: https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Perspective_divide:~:text=)-,Viewport%20transform,-%5Bedit%5D
const viewportTransform = Fn(
  ([normalizedDeviceCoordinates]: [ShaderNodeObject<OperatorNode>]) =>
    // TODO: Read this programmatically.
    normalizedDeviceCoordinates
      .mul(screenSize.div(2))
      // .add(viewportCoordinate)
      .add(screenSize.div(2)),
);

const clipToFragment = Fn(
  ([clipSpaceVertex]: [ShaderNodeObject<OperatorNode>]) =>
    viewportTransform(perspectiveDivide(clipSpaceVertex)),
);

const boolToSign = Fn(([booleanValue]: [ShaderNodeObject<OperatorNode>]) =>
  float(2).mul(booleanValue.oneMinus()).sub(1),
);

const VertexNode = Fn(() => {
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

  const startFragment = clipToFragment(start);
  const endFragment = clipToFragment(end);
  const nextFragment = clipToFragment(next);
  const previousFragment = clipToFragment(previous);

  varyingProperty("vec2", "vStartFragment").assign(startFragment);
  varyingProperty("vec2", "vEndFragment").assign(endFragment);
  varyingProperty("vec2", "vNextFragment").assign(nextFragment);
  varyingProperty("vec2", "vPreviousFragment").assign(previousFragment);

  const screenSpaceSegmentUnitVector = normalize(
    endFragment.sub(startFragment),
  );
  const screenSpaceSegmentUnitNormal = vec2(
    screenSpaceSegmentUnitVector.y.negate(),
    screenSpaceSegmentUnitVector.x,
  );

  const isStart = attribute("start");
  const isBottom = attribute("bottom");

  const fragmentOffsetUnitVector = screenSpaceSegmentUnitVector
    .mul(boolToSign(isStart))
    .add(screenSpaceSegmentUnitNormal.mul(boolToSign(isBottom)))
    .normalize();

  const cameraSpaceFragmentOffset = fragmentOffsetUnitVector.mul(lineWidth);

  const glPosition = select(isStart.equal(float(1)), start, end).toVar();
  const clipSpaceFragmentOffset = cameraProjectionMatrix.mul(
    vec4(fragmentOffsetUnitVector.xy, 0, 1),
  ).xy;
  glPosition.xy.addAssign(clipSpaceFragmentOffset);
  return vec4(glPosition.xyz, 1);
});

export default VertexNode;
