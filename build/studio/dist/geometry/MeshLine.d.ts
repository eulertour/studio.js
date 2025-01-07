import * as THREE from "three";
import MeshLineGeometry from "./MeshLineGeometry.js";
import MeshLineMaterial from "./MeshLineMaterial.js";
export default class MeshLine extends THREE.Mesh<MeshLineGeometry, MeshLineMaterial> {
    constructor(geometry: MeshLineGeometry, material: MeshLineMaterial);
    get points(): THREE.Vector3[];
    get dashOffset(): number;
    set dashOffset(dashOffset: number);
}
export { MeshLine, MeshLineGeometry, MeshLineMaterial };
//# sourceMappingURL=MeshLine.d.ts.map