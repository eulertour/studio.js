import * as THREE from "three/webgpu";
import { Uniforms } from "./index.js";
export default class WebGPUMeshLineGeometry extends THREE.BufferGeometry {
    position: Float32Array<ArrayBuffer>;
    endPosition: Float32Array<ArrayBuffer>;
    prevPosition: Float32Array<ArrayBuffer>;
    nextPosition: Float32Array<ArrayBuffer>;
    positionOffset: Float32Array<ArrayBuffer>;
    vertexOffset: Float32Array<ArrayBuffer>;
    indices: Uint16Array<ArrayBuffer>;
    constructor(points: THREE.Vector3[]);
    getPoint(index: number, output: THREE.Vector3): void;
    getOffset(index: number): number;
    get points(): THREE.Vector3[];
    get numStrokePoints(): number;
    get strokeLength(): number;
    fillArrowSegmentData(proportion: number, output: Uniforms): void;
    setPoints(points: Array<THREE.Vector3>, updateBounds?: boolean): void;
    allocateNewBuffers(numSegments: number): void;
    setVariableDataNeedsUpdate(): void;
    setStaticDataNeedsUpdate(): void;
    fillBuffers(points: THREE.Vector3[]): void;
    fillPoints(points: THREE.Vector3[]): void;
    writeVector3ToSegment(array: WritableArrayLike<number>, segmentIndex: number, v: THREE.Vector3Like): void;
    writeVector4ToSegment(array: WritableArrayLike<number>, segmentIndex: number, v: THREE.Vector4Like): void;
    fillVertexOffsets(numStrokeSegments: number): void;
    fillIndices(segmentCount: number): void;
    fillOffsets(points: THREE.Vector3[]): void;
    computeBoundingSphere(): void;
    computeBoundingSphereCenter(center: THREE.Vector3): void;
    computeBoundingSphereRadius(center: THREE.Vector3): number;
}
interface WritableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}
export {};
//# sourceMappingURL=Geometry.d.ts.map