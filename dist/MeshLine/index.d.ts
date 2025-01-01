import THREE from "../three.js";
import MeshLineGeometry from "./MeshLineGeometry.js";
import MeshLineMaterial from "./MeshLineMaterial.js";
declare class MeshLine extends THREE.Mesh<MeshLineGeometry, MeshLineMaterial> {
    constructor(geometry: MeshLineGeometry, material: MeshLineMaterial);
    get points(): THREE.Vector3[];
    get dashOffset(): number;
    set dashOffset(dashOffset: number);
}
export { MeshLine, MeshLineGeometry, MeshLineMaterial };
//# sourceMappingURL=index.d.ts.map