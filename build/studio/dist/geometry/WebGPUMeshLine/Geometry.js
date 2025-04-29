import * as THREE from "three/webgpu";
import { indexOrThrow, bufferIndexOrThrow } from "../../utils.js";
const NUM_ARROW_SEGMENTS = 2;
export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
    constructor(points) {
        super();
        // NOTE: The vertexOffset attribute is used to expand the segments
        // between consecutive points into quads in the vertex shader. The
        // other attributes are duplicated across each vertex in a segment
        // to be used in the fragment shader.
        Object.defineProperty(this, "position", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Float32Array()
        });
        Object.defineProperty(this, "endPosition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Float32Array()
        });
        Object.defineProperty(this, "prevPosition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Float32Array()
        });
        Object.defineProperty(this, "nextPosition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Float32Array()
        });
        Object.defineProperty(this, "positionOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Float32Array()
        });
        Object.defineProperty(this, "vertexOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Float32Array()
        });
        Object.defineProperty(this, "indices", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Uint16Array()
        });
        this.setPoints(points);
    }
    getPoint(index, output) {
        let buffer, segmentIndex;
        const numStrokeSegments = this.numStrokePoints - 1;
        if (index === numStrokeSegments) {
            buffer = this.endPosition;
            segmentIndex = index - 1;
        }
        else {
            buffer = this.position;
            segmentIndex = index;
        }
        const bufferOffset = 12 * segmentIndex;
        const x = bufferIndexOrThrow(buffer, bufferOffset);
        const y = bufferIndexOrThrow(buffer, bufferOffset + 1);
        const z = bufferIndexOrThrow(buffer, bufferOffset + 2);
        output.set(x, y, z);
    }
    getOffset(index) {
        const numStrokeSegments = this.numStrokePoints - 1;
        const lastSegmentIndex = numStrokeSegments - 1;
        if (index === lastSegmentIndex + 1) {
            return bufferIndexOrThrow(this.positionOffset, 16 * lastSegmentIndex + 1);
        }
        else {
            const bufferOffset = 16 * index;
            return bufferIndexOrThrow(this.positionOffset, bufferOffset);
        }
    }
    get numStrokePoints() {
        const numSegments = this.positionOffset.length / 16;
        return numSegments - NUM_ARROW_SEGMENTS + 1;
    }
    get strokeLength() {
        const numStrokeSegments = this.numStrokePoints - 1;
        const lastSegmentIndex = numStrokeSegments - 1;
        return bufferIndexOrThrow(this.positionOffset, 16 * lastSegmentIndex + 1);
    }
    fillArrowSegmentData(proportion, output) {
        const totalLength = this.strokeLength;
        // PERF: This could be done with binary search.
        for (let i = 0; i < this.numStrokePoints - 1; i++) {
            const startProportion = this.getOffset(i) / totalLength;
            const endProportion = this.getOffset(i + 1) / totalLength;
            if (startProportion <= proportion && proportion <= endProportion) {
                this.getPoint(i, output.arrowSegmentStart.value);
                this.getPoint(i + 1, output.arrowSegmentEnd.value);
                output.arrowSegmentProportion.value = THREE.MathUtils.inverseLerp(startProportion, endProportion, proportion);
                return;
            }
        }
        throw new Error(`Invalid arrow proportion ${proportion}`);
    }
    setPoints(points, updateBounds = true) {
        const sizeChanged = this.numStrokePoints !== points.length;
        if (sizeChanged) {
            this.allocateNewBuffers(points.length - 1);
        }
        else {
            this.setVariableDataNeedsUpdate();
        }
        this.fillBuffers(points);
        if (updateBounds) {
            this.computeBoundingSphere();
            this.computeBoundingBox();
        }
    }
    allocateNewBuffers(numSegments) {
        const totalSegments = numSegments + NUM_ARROW_SEGMENTS;
        this.dispose();
        this.position = new Float32Array(12 * totalSegments);
        this.endPosition = new Float32Array(12 * totalSegments);
        this.prevPosition = new Float32Array(12 * totalSegments);
        this.nextPosition = new Float32Array(12 * totalSegments);
        this.positionOffset = new Float32Array(16 * totalSegments);
        this.vertexOffset = new Float32Array(8 * totalSegments);
        this.indices = new Uint16Array(6 * totalSegments);
        const positionBuffer = new THREE.BufferAttribute(this.position, 3);
        const endPositionBuffer = new THREE.BufferAttribute(this.endPosition, 3);
        const prevPositionBuffer = new THREE.BufferAttribute(this.prevPosition, 3);
        const nextPositionBuffer = new THREE.BufferAttribute(this.nextPosition, 3);
        const positionOffsetBuffer = new THREE.BufferAttribute(this.positionOffset, 4);
        const vertexOffsetBuffer = new THREE.BufferAttribute(this.vertexOffset, 2);
        const indexBuffer = new THREE.BufferAttribute(this.indices, 1);
        this.setAttribute("position", positionBuffer);
        this.setAttribute("endPosition", endPositionBuffer);
        this.setAttribute("prevPosition", prevPositionBuffer);
        this.setAttribute("nextPosition", nextPositionBuffer);
        this.setAttribute("positionOffset", positionOffsetBuffer);
        this.setAttribute("vertexOffset", vertexOffsetBuffer);
        this.setIndex(indexBuffer);
        this.setVariableDataNeedsUpdate();
        this.setStaticDataNeedsUpdate();
    }
    setVariableDataNeedsUpdate() {
        this.getAttribute("position").needsUpdate = true;
        this.getAttribute("endPosition").needsUpdate = true;
        this.getAttribute("prevPosition").needsUpdate = true;
        this.getAttribute("nextPosition").needsUpdate = true;
        this.getAttribute("positionOffset").needsUpdate = true;
    }
    setStaticDataNeedsUpdate() {
        this.getAttribute("vertexOffset").needsUpdate = true;
        if (this.index !== null) {
            this.index.needsUpdate = true;
        }
    }
    fillBuffers(points) {
        this.fillPoints(points);
        this.fillVertexOffsets(points.length - 1);
        this.fillOffsets(points);
        this.fillIndices(points.length - 1);
    }
    fillPoints(points) {
        const numStrokeSegments = points.length - 1;
        for (let i = 0; i < numStrokeSegments; i++) {
            const startPoint = indexOrThrow(points, i);
            const endPoint = indexOrThrow(points, i + 1);
            const prevPoint = indexOrThrow(points, Math.max(i - 1, 0));
            const nextPoint = indexOrThrow(points, Math.min(i + 2, points.length - 1));
            this.writeVector3ToSegment(this.position, i, startPoint);
            this.writeVector3ToSegment(this.endPosition, i, endPoint);
            this.writeVector3ToSegment(this.prevPosition, i, prevPoint);
            this.writeVector3ToSegment(this.nextPosition, i, nextPoint);
        }
        // NOTE: Arrow segments are skipped since they don't use this
        // data.
    }
    writeVector3ToSegment(array, segmentIndex, v) {
        const { x, y, z } = v;
        const arrayOffset = 12 * segmentIndex;
        array[arrayOffset] = x;
        array[arrayOffset + 1] = y;
        array[arrayOffset + 2] = z;
        array[arrayOffset + 3] = x;
        array[arrayOffset + 4] = y;
        array[arrayOffset + 5] = z;
        array[arrayOffset + 6] = x;
        array[arrayOffset + 7] = y;
        array[arrayOffset + 8] = z;
        array[arrayOffset + 9] = x;
        array[arrayOffset + 10] = y;
        array[arrayOffset + 11] = z;
    }
    writeVector4ToSegment(array, segmentIndex, v) {
        const { x, y, z, w } = v;
        const arrayOffset = 16 * segmentIndex;
        array[arrayOffset] = x;
        array[arrayOffset + 1] = y;
        array[arrayOffset + 2] = z;
        array[arrayOffset + 3] = w;
        array[arrayOffset + 4] = x;
        array[arrayOffset + 5] = y;
        array[arrayOffset + 6] = z;
        array[arrayOffset + 7] = w;
        array[arrayOffset + 8] = x;
        array[arrayOffset + 9] = y;
        array[arrayOffset + 10] = z;
        array[arrayOffset + 11] = w;
        array[arrayOffset + 12] = x;
        array[arrayOffset + 13] = y;
        array[arrayOffset + 14] = z;
        array[arrayOffset + 15] = w;
    }
    // NOTE: This diagram shows the ordering of the vertices
    // that define a segment together with the vertexOffsets
    // written to each one.
    // y ^
    //   |1, (-1, 1)        3, (1, 1)
    //   *-----------------*
    //   |\               /|
    //   | *-------------* |
    //   |/               \|
    //   *-----------------*--> x
    //  0, (-1, -1)         2, (1, -1)
    fillVertexOffsets(numStrokeSegments) {
        let i = 0;
        for (i = 0; i < numStrokeSegments; i++) {
            const arrayOffset = 8 * i;
            this.vertexOffset[arrayOffset] = -1;
            this.vertexOffset[arrayOffset + 1] = -1;
            this.vertexOffset[arrayOffset + 2] = -1;
            this.vertexOffset[arrayOffset + 3] = 1;
            this.vertexOffset[arrayOffset + 4] = 1;
            this.vertexOffset[arrayOffset + 5] = -1;
            this.vertexOffset[arrayOffset + 6] = 1;
            this.vertexOffset[arrayOffset + 7] = 1;
        }
        // NOTE: Offsets are scaled by 2 or 3 for the top and bottom
        // arrow segments, respectively.
        for (let j = 0; j < NUM_ARROW_SEGMENTS; j++) {
            const arrayOffset = 8 * (i + j);
            const scale = j + 2;
            this.vertexOffset[arrayOffset] = -scale;
            this.vertexOffset[arrayOffset + 1] = -scale;
            this.vertexOffset[arrayOffset + 2] = -scale;
            this.vertexOffset[arrayOffset + 3] = scale;
            this.vertexOffset[arrayOffset + 4] = scale;
            this.vertexOffset[arrayOffset + 5] = -scale;
            this.vertexOffset[arrayOffset + 6] = scale;
            this.vertexOffset[arrayOffset + 7] = scale;
        }
    }
    // NOTE: The indices are chosen to construct the segment
    // as shown here. The order is important because only the
    // front side of 3D lines is rendered.
    // 1, 3              5
    // *-----------------*
    // |                 |
    // |                 |
    // |                 |
    // *-----------------*
    // 2                 0, 4
    fillIndices(segmentCount) {
        for (let i = 0; i < segmentCount + NUM_ARROW_SEGMENTS; i++) {
            const arrayOffset = 6 * i;
            const nextIndex = 4 * i;
            this.indices[arrayOffset] = nextIndex + 2;
            this.indices[arrayOffset + 1] = nextIndex + 1;
            this.indices[arrayOffset + 2] = nextIndex;
            this.indices[arrayOffset + 3] = nextIndex + 1;
            this.indices[arrayOffset + 4] = nextIndex + 2;
            this.indices[arrayOffset + 5] = nextIndex + 3;
        }
    }
    fillOffsets(points) {
        const startPoint = indexOrThrow(points, 0);
        let endPoint = indexOrThrow(points, 1);
        let nextPoint = indexOrThrow(points, Math.min(2, points.length - 1));
        let startLength = 0;
        let endLength = startPoint.distanceTo(endPoint);
        let prevLength = 0;
        let nextLength = endLength + endPoint.distanceTo(nextPoint);
        this.writeVector4ToSegment(this.positionOffset, 0, {
            x: startLength,
            y: endLength,
            z: prevLength,
            w: nextLength,
        });
        const strokeSegmentCount = points.length - 1;
        for (let i = 1; i < strokeSegmentCount; i++) {
            const endPoint = indexOrThrow(points, i + 1);
            const nextPoint = indexOrThrow(points, Math.min(i + 2, points.length - 1));
            const prevArrayOffset = 16 * (i - 1);
            const prevLength = bufferIndexOrThrow(this.positionOffset, prevArrayOffset);
            const startLength = bufferIndexOrThrow(this.positionOffset, prevArrayOffset + 1);
            const endLength = bufferIndexOrThrow(this.positionOffset, prevArrayOffset + 3);
            const nextLength = endLength + endPoint.distanceTo(nextPoint);
            this.writeVector4ToSegment(this.positionOffset, i, {
                x: startLength,
                y: endLength,
                z: prevLength,
                w: nextLength,
            });
        }
        // NOTE: Arrow segments are skipped since they don't use this
        // data.
    }
    computeBoundingSphere() {
        if (this.boundingSphere === null) {
            this.boundingSphere = new THREE.Sphere();
        }
        this.computeBoundingSphereCenter(this.boundingSphere.center);
        this.computeBoundingSphereRadius(this.boundingSphere.center);
    }
    computeBoundingSphereCenter(center) {
        center.set(0, 0, 0);
        let x;
        let y;
        let z;
        for (let i = 0; i < this.position.length; i += 12) {
            x = bufferIndexOrThrow(this.position, i);
            y = bufferIndexOrThrow(this.position, i + 1);
            z = bufferIndexOrThrow(this.position, i + 2);
            center.add({ x, y, z });
        }
        const arrayOffset = this.position.length - 12;
        x = bufferIndexOrThrow(this.endPosition, arrayOffset);
        y = bufferIndexOrThrow(this.endPosition, arrayOffset + 1);
        z = bufferIndexOrThrow(this.endPosition, arrayOffset + 2);
        center.add({ x, y, z });
        center.divideScalar(this.position.length / 12 + 1);
    }
    computeBoundingSphereRadius(center) {
        let radius = 0;
        let x;
        let y;
        let z;
        for (let i = 0; i < this.position.length; i += 12) {
            x = bufferIndexOrThrow(this.position, i);
            y = bufferIndexOrThrow(this.position, i + 1);
            z = bufferIndexOrThrow(this.position, i + 2);
            radius = Math.max(radius, center.distanceTo({ x, y, z }));
        }
        const arrayOffset = this.position.length - 12;
        x = bufferIndexOrThrow(this.endPosition, arrayOffset);
        y = bufferIndexOrThrow(this.endPosition, arrayOffset + 1);
        z = bufferIndexOrThrow(this.endPosition, arrayOffset + 2);
        radius = Math.max(radius, center.distanceTo({ x, y, z }));
        return radius;
    }
}
//# sourceMappingURL=Geometry.js.map