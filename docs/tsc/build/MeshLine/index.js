import MeshLineGeometry from "./MeshLineGeometry";
import MeshLineMaterial from "./MeshLineMaterial";
import MeshLineRaycast from "./MeshLineRaycast";
import * as THREE from "three";
class MeshLine extends THREE.Mesh {
    constructor(geometry, material) {
        super(geometry, material);
        this.raycast = MeshLineRaycast;
    }
    get points() {
        return this.geometry.points;
    }
}
export { MeshLine, MeshLineGeometry, MeshLineMaterial };
//# sourceMappingURL=index.js.map