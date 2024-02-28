import MeshLineGeometry from "./MeshLineGeometry";
import MeshLineMaterial from "./MeshLineMaterial";
import MeshLineRaycast from "./MeshLineRaycast";
import * as THREE from "three";

class MeshLine extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.raycast = MeshLineRaycast;
  }
}

export { MeshLine, MeshLineGeometry, MeshLineMaterial };
