import * as THREE from "three";
import MeshLineGeometry from "./MeshLineGeometry.js";
import MeshLineMaterial from "./MeshLineMaterial.js";
import MeshLineRaycast from "./MeshLineRaycast.js";

class MeshLine extends THREE.Mesh<MeshLineGeometry, MeshLineMaterial> {
  constructor(geometry: MeshLineGeometry, material: MeshLineMaterial) {
    super(geometry, material);
    material.totalLength = geometry.totalLength;
    this.raycast = MeshLineRaycast;
  }

  get points() {
    return this.geometry.points;
  }

  get dashOffset() {
    return this.material.uniforms.dashOffset.value;
  }

  set dashOffset(dashOffset: number) {
    this.material.uniforms.dashOffset.value = dashOffset;
  }
}

export { MeshLine, MeshLineGeometry, MeshLineMaterial };
