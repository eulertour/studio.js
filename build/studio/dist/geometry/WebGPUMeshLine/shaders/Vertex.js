import { Fn, attribute, cameraProjectionMatrix, cameraWorldMatrix, distance, float, mat2, mat4, modelViewMatrix, normalize, screenSize, select, varyingProperty, vec2, vec3, vec4, } from "three/tsl";
import { UNITS_PER_STROKE_WIDTH } from "../../../constants.js";
const SQRT_2 = 1.4142135624;
// NOTE: https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Perspective_divide:~:text=defined%20clipping%20region.-,Perspective%20divide,-%5Bedit%5D
const perspectiveDivide = Fn(([clipSpaceVertex]) => clipSpaceVertex.xyz.div(clipSpaceVertex.w));
// NOTE: https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Perspective_divide:~:text=)-,Viewport%20transform,-%5Bedit%5D
const viewportTransform = Fn(([normalizedDeviceCoordinates, viewport, viewportSize, viewportOffset, devicePixelRatio,]) => {
    const viewportSet = viewport.z.greaterThan(0).or(viewport.w.greaterThan(0));
    return select(viewportSet, normalizedDeviceCoordinates
        .mul(viewportSize)
        .mul(devicePixelRatio)
        .div(2)
        .add(viewportSize)
        .mul(devicePixelRatio)
        .div(2)
        .add(vec2(viewportOffset.x.mul(devicePixelRatio), 0)).xy, normalizedDeviceCoordinates.mul(screenSize.div(2)).add(screenSize.div(2))
        .xy);
});
const clipToScreenSpace = Fn(([clipSpaceVertex, viewport, viewportSize, viewportOffset, devicePixelRatio,]) => {
    const normalizedDeviceCoordinate = perspectiveDivide(clipSpaceVertex);
    const screenSpaceFragment = viewportTransform(normalizedDeviceCoordinate, viewport, viewportSize, viewportOffset, devicePixelRatio);
    return screenSpaceFragment;
});
const projectOntoVector = Fn(([vectorToProject, vectorToProjectOnto]) => {
    const projectionUnitVector = vectorToProjectOnto.normalize();
    return vectorToProject.dot(projectionUnitVector).mul(projectionUnitVector);
});
const rotate90 = Fn(([vector]) => vec2(vector.y.negate(), vector.x));
export default class VertexShader {
    constructor(width, firstPosition, secondPosition, arrowSegmentStart, arrowSegmentEnd, arrowSegmentProportion, arrowLength, arrowWidth, viewport, viewportSize, viewportOffset, devicePixelRatio) {
        Object.defineProperty(this, "node", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.node = Fn(() => {
            const cameraWorldMatrixZColumn = cameraWorldMatrix[2];
            if (cameraWorldMatrixZColumn === undefined) {
                throw new Error("Camera z column is undefined");
            }
            const cameraPlaneUnitNormal = cameraWorldMatrixZColumn.xyz
                .negate()
                .normalize();
            const arrowSegmentVector = vec3(arrowSegmentEnd).sub(arrowSegmentStart);
            const arrowSegmentProjectionToCameraPlane = arrowSegmentVector.sub(projectOntoVector(arrowSegmentVector, cameraPlaneUnitNormal));
            const arrowTailUnitOffset = arrowSegmentProjectionToCameraPlane
                .cross(cameraPlaneUnitNormal)
                .normalize();
            const arrowTipPosition = vec3(arrowSegmentStart).add(arrowSegmentVector.mul(arrowSegmentProportion));
            const arrowTopTailPosition = arrowTipPosition
                .add(arrowTailUnitOffset.mul(arrowWidth))
                .add(arrowSegmentVector.negate().normalize().mul(arrowLength));
            const arrowBottomTailPosition = arrowTipPosition
                .add(arrowTailUnitOffset.mul(float(arrowWidth).negate()))
                .add(arrowSegmentVector.negate().normalize().mul(arrowLength));
            const modelViewProjection = cameraProjectionMatrix.mul(modelViewMatrix);
            const clipSpaceLinePoints = modelViewProjection.mul(mat4(vec4(attribute("position"), 1), vec4(attribute("endPosition"), 1), vec4(attribute("prevPosition"), 1), vec4(attribute("nextPosition"), 1)));
            const clipSpaceFirstSegment = modelViewProjection.mul(mat4(vec4(firstPosition, 1), vec4(secondPosition, 1), vec4(0, 0, 0, 0), vec4(0, 0, 0, 0)));
            const clipSpaceArrowPoints = modelViewProjection.mul(mat4(vec4(arrowTipPosition, 1), vec4(arrowTopTailPosition, 1), vec4(arrowBottomTailPosition, 1), vec4(0, 0, 0, 0)));
            const clipSpaceStart = vec4(clipSpaceLinePoints[0]);
            const clipSpaceEnd = vec4(clipSpaceLinePoints[1]);
            const clipSpacePrevious = vec4(clipSpaceLinePoints[2]);
            const clipSpaceNext = vec4(clipSpaceLinePoints[3]);
            const clipSpaceFirstPosition = vec4(clipSpaceFirstSegment[0]);
            const clipSpaceSecondPosition = vec4(clipSpaceFirstSegment[1]);
            const clipSpaceArrowTip = vec4(clipSpaceArrowPoints[0]);
            const clipSpaceTopArrowTail = vec4(clipSpaceArrowPoints[1]);
            const clipSpaceBottomArrowTail = vec4(clipSpaceArrowPoints[2]);
            const startFragment = clipToScreenSpace(clipSpaceStart, viewport, viewportSize, viewportOffset, devicePixelRatio);
            const endFragment = clipToScreenSpace(clipSpaceEnd, viewport, viewportSize, viewportOffset, devicePixelRatio);
            const previousFragment = clipToScreenSpace(clipSpacePrevious, viewport, viewportSize, viewportOffset, devicePixelRatio);
            const nextFragment = clipToScreenSpace(clipSpaceNext, viewport, viewportSize, viewportOffset, devicePixelRatio);
            const firstFragment = clipToScreenSpace(clipSpaceFirstPosition, viewport, viewportSize, viewportOffset, devicePixelRatio);
            const secondFragment = clipToScreenSpace(clipSpaceSecondPosition, viewport, viewportSize, viewportOffset, devicePixelRatio);
            const arrowTipFragment = clipToScreenSpace(clipSpaceArrowTip, viewport, viewportSize, viewportOffset, devicePixelRatio);
            const arrowTopTailFragment = clipToScreenSpace(clipSpaceTopArrowTail, viewport, viewportSize, viewportOffset, devicePixelRatio);
            const arrowBottomTailFragment = clipToScreenSpace(clipSpaceBottomArrowTail, viewport, viewportSize, viewportOffset, devicePixelRatio);
            // NOTE: This is the vector offset from the start or end of the
            // current segment to a corner of the quadrilateral containing
            // it (scaled by 2 or 3 for segments that represent the top or
            // bottom of an arrow, respectively). This vector is represented
            // by the diagonal lines in the diagram below. The components
            // tangent and normal to the segment vector are equal. These
            // components have length 1 for segments making up the stroke and
            // 2 or 3 for segments making up the arrow. The length of the
            // vector is a multiple of sqrt(2).
            // *-------------------*
            // |\                 /|
            // | *---------------* |
            // |/                 \|
            // *-------------------*
            const rawVertexOffset = attribute("vertexOffset");
            const isTopArrowSegment = rawVertexOffset.x.abs().equal(2);
            const isBottomArrowSegment = rawVertexOffset.x.abs().equal(3);
            varyingProperty("vec2", "vStartFragment").assign(select(isTopArrowSegment.or(isBottomArrowSegment), arrowTipFragment, startFragment));
            varyingProperty("vec2", "vEndFragment").assign(select(isTopArrowSegment, arrowTopTailFragment, select(isBottomArrowSegment, arrowBottomTailFragment, endFragment)));
            varyingProperty("vec2", "vPreviousFragment").assign(previousFragment);
            varyingProperty("vec2", "vNextFragment").assign(nextFragment);
            varyingProperty("vec2", "vFirstFragment").assign(firstFragment);
            varyingProperty("vec2", "vSecondFragment").assign(secondFragment);
            varyingProperty("float", "vFirstSegmentLength").assign(distance(firstPosition, secondPosition));
            varyingProperty("float", "vIsArrowSegment").assign(isTopArrowSegment.or(isBottomArrowSegment));
            varyingProperty("float", "vIsTopArrowSegment").assign(isTopArrowSegment);
            varyingProperty("float", "vIsBottomArrowSegment").assign(isBottomArrowSegment);
            varyingProperty("float", "vArrowSegmentLength").assign(arrowTipPosition.distance(arrowTopTailPosition));
            varyingProperty("vec2", "vArrowTipFragment").assign(arrowTipFragment);
            varyingProperty("vec2", "vArrowTopTailFragment").assign(arrowTopTailFragment);
            varyingProperty("vec2", "vArrowBottomTailFragment").assign(arrowBottomTailFragment);
            const tangent = select(isTopArrowSegment, arrowTopTailFragment.sub(arrowTipFragment), select(isBottomArrowSegment, arrowBottomTailFragment.sub(arrowTipFragment), endFragment.sub(startFragment)));
            const unitTangent = normalize(tangent);
            const unitNormal = rotate90(unitTangent);
            // HACK: Add slightly more to the offset to avoid artifacts.
            const vertexOffset = rawVertexOffset.normalize().mul(SQRT_2 + 0.1);
            const unitOffset = mat2(unitTangent, unitNormal).mul(vertexOffset);
            const cameraSpaceVertexOffset = vec4(unitOffset.mul(width).mul(UNITS_PER_STROKE_WIDTH), 0, 0);
            const clipSpaceVertexOffset = cameraProjectionMatrix.mul(cameraSpaceVertexOffset);
            const linePointVertex = select(isTopArrowSegment, select(vertexOffset.x.lessThan(0), clipSpaceArrowTip, clipSpaceTopArrowTail), select(isBottomArrowSegment, select(vertexOffset.x.lessThan(0), clipSpaceArrowTip, clipSpaceBottomArrowTail), select(vertexOffset.x.lessThan(0), clipSpaceStart, clipSpaceEnd)));
            return linePointVertex.add(clipSpaceVertexOffset);
        });
    }
}
//# sourceMappingURL=Vertex.js.map