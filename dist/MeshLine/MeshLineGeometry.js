var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MeshLineGeometry_instances, _MeshLineGeometry_position, _MeshLineGeometry_endPosition, _MeshLineGeometry_nextPosition, _MeshLineGeometry_previousPosition, _MeshLineGeometry_textureCoords, _MeshLineGeometry_proportion, _MeshLineGeometry_endProportion, _MeshLineGeometry_indices, _MeshLineGeometry_attributes, _MeshLineGeometry_previousPointCount, _MeshLineGeometry_pointCount, _MeshLineGeometry_addSegment, _MeshLineGeometry_makeNewBuffers;
import * as THREE from 'three';
import './meshline.glsl.js';
class MeshLineGeometry extends THREE.BufferGeometry {
    constructor(arrow = false) {
        super();
        _MeshLineGeometry_instances.add(this);
        Object.defineProperty(this, "arrow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: arrow
        });
        Object.defineProperty(this, "isMeshLineGeometry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'MeshLineGeometry'
        });
        _MeshLineGeometry_position.set(this, new Float32Array());
        _MeshLineGeometry_endPosition.set(this, new Float32Array());
        _MeshLineGeometry_nextPosition.set(this, new Float32Array());
        _MeshLineGeometry_previousPosition.set(this, new Float32Array());
        _MeshLineGeometry_textureCoords.set(this, new Float32Array());
        _MeshLineGeometry_proportion.set(this, new Float32Array());
        _MeshLineGeometry_endProportion.set(this, new Float32Array());
        _MeshLineGeometry_indices.set(this, new Uint16Array());
        _MeshLineGeometry_attributes.set(this, null);
        Object.defineProperty(this, "points", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "totalLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _MeshLineGeometry_previousPointCount.set(this, 0);
        _MeshLineGeometry_pointCount.set(this, 0);
    }
    setPoints(points, updateBounds = true) {
        const arrowLength = 0.3;
        if (this.arrow) {
            // Find the index of the last point that is at least arrowLength away from the end.
            let arrowIndex = 0;
            for (let i = points.length - 2; i >= 0; i--) {
                const point = points[i];
                if (point.distanceTo(points[points.length - 1]) >= arrowLength) {
                    arrowIndex = i;
                    break;
                }
            }
            // Find the point that is arrowLength away from the end.
            const aVec = points[arrowIndex];
            const bVec = points[points.length - 1];
            const vVec = new THREE.Vector3().subVectors(points[arrowIndex + 1], aVec);
            const d = arrowLength;
            const a = vVec.dot(vVec);
            const b = 2 * (aVec.dot(vVec) - bVec.dot(vVec));
            const c = aVec.dot(aVec) - 2 * aVec.dot(bVec) + bVec.dot(bVec) - d * d;
            const rootDiscriminant = Math.sqrt(b * b - 4 * a * c);
            const t1 = (-b + rootDiscriminant) / (2 * a);
            const t2 = (-b - rootDiscriminant) / (2 * a);
            let t;
            if (0 <= t1 && t1 <= 1) {
                t = t1;
            }
            else if (0 <= t2 && t2 <= 1) {
                t = t2;
            }
            else {
                console.error(points);
                throw new Error('Error creating arrow from points: No valid solution');
            }
            points.splice(arrowIndex + 1, points.length - arrowIndex - 1, aVec.clone().add(vVec.clone().multiplyScalar(t)), points.at(-1));
        }
        this.points = points;
        __classPrivateFieldSet(this, _MeshLineGeometry_pointCount, points.length, "f");
        const pointCount = __classPrivateFieldGet(this, _MeshLineGeometry_pointCount, "f");
        const sizeChanged = __classPrivateFieldGet(this, _MeshLineGeometry_previousPointCount, "f") !== pointCount;
        if (!__classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f") || sizeChanged) {
            __classPrivateFieldGet(this, _MeshLineGeometry_instances, "m", _MeshLineGeometry_makeNewBuffers).call(this, pointCount);
        }
        __classPrivateFieldSet(this, _MeshLineGeometry_previousPointCount, pointCount, "f");
        const lengths = new Float32Array(this.points.length);
        lengths[0] = 0;
        const firstPoint = points.at(0);
        const lastPoint = points.at(-1);
        if (firstPoint === undefined || lastPoint === undefined) {
            throw new Error('invalid endpoints');
        }
        // Handle the case where the first and last points are the same.
        let previousPosition;
        if (new THREE.Vector3().subVectors(firstPoint, lastPoint).length() < 0.001) {
            previousPosition = points.at(-1);
        }
        else {
            previousPosition = points.at(0);
        }
        let nextPosition;
        if (points.length < 3) {
            nextPosition = points[1];
        }
        else {
            nextPosition = points[2];
        }
        let position = points[0];
        let endPosition = points[1];
        let previousLength = lengths[0];
        if (previousPosition === undefined ||
            position === undefined ||
            endPosition === undefined ||
            nextPosition === undefined ||
            previousLength === undefined) {
            throw new Error('point missing');
        }
        lengths[1] =
            previousLength +
                ((position.x - endPosition.x) ** 2 +
                    (position.y - endPosition.y) ** 2 +
                    (position.z - endPosition.z) ** 2) **
                    0.5;
        __classPrivateFieldGet(this, _MeshLineGeometry_instances, "m", _MeshLineGeometry_addSegment).call(this, 0, previousPosition, position, endPosition, nextPosition);
        for (let i = 1; i < this.points.length - 2; i++) {
            const previousPosition = points[i - 1];
            const position = points[i];
            const endPosition = points[i + 1];
            const nextPosition = points[i + 2];
            const previousLength = lengths[i];
            if (previousPosition === undefined ||
                position === undefined ||
                endPosition === undefined ||
                nextPosition === undefined ||
                previousLength === undefined) {
                throw new Error('point missing');
            }
            lengths[i + 1] =
                previousLength +
                    ((position.x - endPosition.x) ** 2 +
                        (position.y - endPosition.y) ** 2 +
                        (position.z - endPosition.z) ** 2) **
                        0.5;
            __classPrivateFieldGet(this, _MeshLineGeometry_instances, "m", _MeshLineGeometry_addSegment).call(this, i, previousPosition, position, endPosition, nextPosition);
        }
        // Handle the case where the first and last points are the same.
        if (new THREE.Vector3().subVectors(firstPoint, lastPoint).length() < 0.001) {
            nextPosition = points.at(1);
        }
        else {
            nextPosition = points.at(-1);
        }
        if (points.length < 3) {
            previousPosition = points.at(-2);
        }
        else {
            previousPosition = points.at(-3);
        }
        position = points.at(-2);
        endPosition = points.at(-1);
        previousLength = lengths.at(-2);
        if (previousPosition === undefined ||
            position === undefined ||
            endPosition === undefined ||
            nextPosition === undefined ||
            previousLength === undefined) {
            throw new Error('point missing');
        }
        lengths[this.points.length - 1] =
            previousLength +
                ((position.x - endPosition.x) ** 2 +
                    (position.y - endPosition.y) ** 2 +
                    (position.z - endPosition.z) ** 2) **
                    0.5;
        __classPrivateFieldGet(this, _MeshLineGeometry_instances, "m", _MeshLineGeometry_addSegment).call(this, points.length - 2, previousPosition, position, endPosition, nextPosition);
        if (this.arrow) {
            __classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f")[4 * (points.length - 3)] = 9; // 8 * 1 + 2 * 0 + 1;
            __classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f")[4 * (points.length - 3) + 1] = 8; // 8 * 1 + 2 * 0 + 0;
            __classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f")[4 * (points.length - 3) + 2] = 10; // 8 * 1 + 2 * 1 + 0;
            __classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f")[4 * (points.length - 3) + 3] = 11; // 8 * 1 + 2 * 1 + 1;
            __classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f")[4 * (points.length - 2)] = 5; // 4 * 1 + 2 * 0 + 1;
            __classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f")[4 * (points.length - 2) + 1] = 4; // 4 * 1 + 2 * 0 + 0;
            __classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f")[4 * (points.length - 2) + 2] = 6; // 4 * 1 + 2 * 1 + 0;
            __classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f")[4 * (points.length - 2) + 3] = 7; // 4 * 1 + 2 * 1 + 1;
        }
        this.totalLength = lengths.at(-1);
        if (this.totalLength === undefined) {
            throw new Error('Invalid length');
        }
        for (let i = 0; i < this.points.length - 1; i++) {
            const startLength = lengths[i];
            const endLength = lengths[i + 1];
            if (startLength === undefined || endLength === undefined) {
                throw new Error('Invalid length');
            }
            const startProportion = startLength / this.totalLength;
            const endProportion = endLength / this.totalLength;
            const offset = 4 * i;
            __classPrivateFieldGet(this, _MeshLineGeometry_proportion, "f")[offset] = startProportion;
            __classPrivateFieldGet(this, _MeshLineGeometry_proportion, "f")[offset + 1] = startProportion;
            __classPrivateFieldGet(this, _MeshLineGeometry_proportion, "f")[offset + 2] = startProportion;
            __classPrivateFieldGet(this, _MeshLineGeometry_proportion, "f")[offset + 3] = startProportion;
            __classPrivateFieldGet(this, _MeshLineGeometry_endProportion, "f")[offset] = endProportion;
            __classPrivateFieldGet(this, _MeshLineGeometry_endProportion, "f")[offset + 1] = endProportion;
            __classPrivateFieldGet(this, _MeshLineGeometry_endProportion, "f")[offset + 2] = endProportion;
            __classPrivateFieldGet(this, _MeshLineGeometry_endProportion, "f")[offset + 3] = endProportion;
        }
        if (!__classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f"))
            throw new Error('missing attributes');
        __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").position.needsUpdate = true;
        __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").endPosition.needsUpdate = true;
        __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").nextPosition.needsUpdate = true;
        __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").previousPosition.needsUpdate = true;
        __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").textureCoords.needsUpdate = sizeChanged;
        __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").proportion.needsUpdate = true;
        __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").endProportion.needsUpdate = true;
        __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").index.needsUpdate = sizeChanged;
        if (updateBounds) {
            this.computeBoundingSphere();
            this.computeBoundingBox();
        }
    }
    setVertexData(array, offset, x, y, z) {
        array[offset] = x;
        array[offset + 1] = y;
        array[offset + 2] = z;
        array[offset + 3] = x;
        array[offset + 4] = y;
        array[offset + 5] = z;
        array[offset + 6] = x;
        array[offset + 7] = y;
        array[offset + 8] = z;
        array[offset + 9] = x;
        array[offset + 10] = y;
        array[offset + 11] = z;
    }
    // These are used to specify where each vertex falls on the line.
    // y ^
    //   |                  3
    // 0 *-----------------*
    //   |                 |
    //   |                 |
    //   |                 |
    //   *-----------------*--> x
    // 1                   2
    setTextureCoords(array, offset) {
        array[offset] = 1; // 8 * 0 + 4 * 0 + 2 * 0 + 1;
        // array[offset + 1] = 0; // 8 * 0 + 4 * 0 + 2 * 0 + 0;
        array[offset + 2] = 2; // 8 * 0 + 4 * 0 + 2 * 1 + 0;
        array[offset + 3] = 3; // 8 * 0 + 4 * 0 + 2 * 1 + 1;
    }
    // 0, 3              5
    // *-----------------*
    // |                 |
    // |                 |
    // |                 |
    // *-----------------*
    // 1                 2, 4
    setIndices(array, offset, startIndex) {
        array[offset] = startIndex;
        array[offset + 1] = startIndex + 1;
        array[offset + 2] = startIndex + 2;
        array[offset + 3] = startIndex;
        array[offset + 4] = startIndex + 2;
        array[offset + 5] = startIndex + 3;
    }
    computeBoundingSphere() {
        if (this.boundingSphere === null) {
            this.boundingSphere = new THREE.Sphere();
        }
        const center = new THREE.Vector3();
        for (const point of this.points) {
            this.boundingSphere.center.add(point);
        }
        this.boundingSphere.center.divideScalar(this.points.length);
        this.boundingSphere.radius = 0;
        for (const point of this.points) {
            this.boundingSphere.radius = Math.max(this.boundingSphere.radius, center.distanceTo(point));
        }
    }
}
_MeshLineGeometry_position = new WeakMap(), _MeshLineGeometry_endPosition = new WeakMap(), _MeshLineGeometry_nextPosition = new WeakMap(), _MeshLineGeometry_previousPosition = new WeakMap(), _MeshLineGeometry_textureCoords = new WeakMap(), _MeshLineGeometry_proportion = new WeakMap(), _MeshLineGeometry_endProportion = new WeakMap(), _MeshLineGeometry_indices = new WeakMap(), _MeshLineGeometry_attributes = new WeakMap(), _MeshLineGeometry_previousPointCount = new WeakMap(), _MeshLineGeometry_pointCount = new WeakMap(), _MeshLineGeometry_instances = new WeakSet(), _MeshLineGeometry_addSegment = function _MeshLineGeometry_addSegment(index, previous, start, end, next) {
    const vertexOffset = 12 * index;
    let x;
    let y;
    let z;
    ({ x, y, z } = previous);
    this.setVertexData(__classPrivateFieldGet(this, _MeshLineGeometry_previousPosition, "f"), vertexOffset, x, y, z);
    ({ x, y, z } = start);
    this.setVertexData(__classPrivateFieldGet(this, _MeshLineGeometry_position, "f"), vertexOffset, x, y, z);
    ({ x, y, z } = end);
    this.setVertexData(__classPrivateFieldGet(this, _MeshLineGeometry_endPosition, "f"), vertexOffset, x, y, z);
    ({ x, y, z } = next);
    this.setVertexData(__classPrivateFieldGet(this, _MeshLineGeometry_nextPosition, "f"), vertexOffset, x, y, z);
    const textureOffset = 4 * index;
    this.setTextureCoords(__classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f"), textureOffset);
    const indexOffset = 6 * index;
    const nextIndex = 4 * index;
    this.setIndices(__classPrivateFieldGet(this, _MeshLineGeometry_indices, "f"), indexOffset, nextIndex);
}, _MeshLineGeometry_makeNewBuffers = function _MeshLineGeometry_makeNewBuffers(pointCount) {
    // Remove the previous buffers from the GPU
    this.dispose();
    const rectCount = pointCount - 1;
    __classPrivateFieldSet(this, _MeshLineGeometry_previousPosition, new Float32Array(12 * rectCount), "f");
    __classPrivateFieldSet(this, _MeshLineGeometry_position, new Float32Array(12 * rectCount), "f");
    __classPrivateFieldSet(this, _MeshLineGeometry_endPosition, new Float32Array(12 * rectCount), "f");
    __classPrivateFieldSet(this, _MeshLineGeometry_nextPosition, new Float32Array(12 * rectCount), "f");
    __classPrivateFieldSet(this, _MeshLineGeometry_textureCoords, new Float32Array(4 * rectCount), "f");
    __classPrivateFieldSet(this, _MeshLineGeometry_proportion, new Float32Array(4 * rectCount), "f");
    __classPrivateFieldSet(this, _MeshLineGeometry_endProportion, new Float32Array(4 * rectCount), "f");
    __classPrivateFieldSet(this, _MeshLineGeometry_indices, new Uint16Array(6 * rectCount), "f");
    __classPrivateFieldSet(this, _MeshLineGeometry_attributes, {
        previousPosition: new THREE.BufferAttribute(__classPrivateFieldGet(this, _MeshLineGeometry_previousPosition, "f"), 3),
        position: new THREE.BufferAttribute(__classPrivateFieldGet(this, _MeshLineGeometry_position, "f"), 3),
        endPosition: new THREE.BufferAttribute(__classPrivateFieldGet(this, _MeshLineGeometry_endPosition, "f"), 3),
        nextPosition: new THREE.BufferAttribute(__classPrivateFieldGet(this, _MeshLineGeometry_nextPosition, "f"), 3),
        textureCoords: new THREE.BufferAttribute(__classPrivateFieldGet(this, _MeshLineGeometry_textureCoords, "f"), 1),
        proportion: new THREE.BufferAttribute(__classPrivateFieldGet(this, _MeshLineGeometry_proportion, "f"), 1),
        endProportion: new THREE.BufferAttribute(__classPrivateFieldGet(this, _MeshLineGeometry_endProportion, "f"), 1),
        index: new THREE.BufferAttribute(__classPrivateFieldGet(this, _MeshLineGeometry_indices, "f"), 1),
    }, "f");
    this.setAttribute('position', __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").position);
    this.setAttribute('endPosition', __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").endPosition);
    this.setAttribute('nextPosition', __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").nextPosition);
    this.setAttribute('previousPosition', __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").previousPosition);
    this.setAttribute('textureCoords', __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").textureCoords);
    this.setAttribute('proportion', __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").proportion);
    this.setAttribute('endProportion', __classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").endProportion);
    this.setIndex(__classPrivateFieldGet(this, _MeshLineGeometry_attributes, "f").index);
};
export default MeshLineGeometry;
//# sourceMappingURL=MeshLineGeometry.js.map