import * as THREE from "three/webgpu";
import DashAtlas from "./DashAtlas.js";
import { Uniforms } from "./index.js";
export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
    dashAtlas: DashAtlas;
    uniforms: Uniforms;
    dashSpeed: number;
    previousDashOffset: number;
    constructor(uniforms: Uniforms, dashSpeed: number, dashPattern: number[], threeDimensions: boolean);
    update(dt: number): void;
    dispose(): void;
}
//# sourceMappingURL=Material.d.ts.map