import * as THREE from "three/webgpu";
import { ShaderNodeObject } from "three/tsl";
export default class DashAtlas {
    atlas: THREE.DataTexture;
    period: ShaderNodeObject<THREE.UniformNode<number>>;
    constructor(pattern: number[]);
    getPeriod(pattern: number[]): number;
    computeSegmentBoundaries(pattern: number[]): number[];
    generateAtlasData(pattern: number[]): Int8Array<ArrayBuffer>;
}
//# sourceMappingURL=DashAtlas.d.ts.map