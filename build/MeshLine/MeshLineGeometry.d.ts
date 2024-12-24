import * as THREE from 'three';
import './meshline.glsl.js';
export default class MeshLineGeometry extends THREE.BufferGeometry {
    #private;
    arrow: boolean;
    readonly isMeshLineGeometry = true;
    readonly type = "MeshLineGeometry";
    points: THREE.Vector3[];
    totalLength: number;
    constructor(arrow?: boolean);
    setPoints(points: Array<THREE.Vector3>, updateBounds?: boolean): void;
    setVertexData(array: WritableArrayLike<number>, offset: number, x: number, y: number, z: number): void;
    setTextureCoords(array: WritableArrayLike<number>, offset: number): void;
    setIndices(array: WritableArrayLike<number>, offset: number, startIndex: number): void;
    computeBoundingSphere(): void;
}
interface WritableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}
export {};
