import MeshLineGeometry from "./MeshLineGeometry";
import MeshLineMaterial from "./MeshLineMaterial";
import * as THREE from "three";
declare class MeshLine extends THREE.Mesh<MeshLineGeometry, MeshLineMaterial> {
    constructor(geometry: MeshLineGeometry, material: MeshLineMaterial);
}
export { MeshLine, MeshLineGeometry, MeshLineMaterial };
