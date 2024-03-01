import { BufferGeometry, Vector3 } from "three";
import "./meshline.glsl.js";
export default class MeshLineGeometry extends BufferGeometry {
    #private;
    arrow: boolean;
    readonly isMeshLineGeometry = true;
    readonly type = "MeshLineGeometry";
    points: Vector3[];
    constructor(arrow?: boolean);
    setPoints(points: Array<Vector3>, updateBounds?: boolean): void;
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
