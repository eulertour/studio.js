import MeshLineGeometry from "./MeshLineGeometry";
import MeshLineMaterial from "./MeshLineMaterial";
import MeshLineRaycast from "./MeshLineRaycast";
import * as THREE from "three";

class MeshLine extends THREE.Mesh<MeshLineGeometry, MeshLineMaterial>{
  constructor(geometry: MeshLineGeometry, material: MeshLineMaterial) {
    super(geometry, material);
    this.raycast = MeshLineRaycast;
  }
}

export { MeshLine, MeshLineGeometry, MeshLineMaterial };
