import * as THREE from 'three';
import MeshLineGeometry from './MeshLineGeometry';
import MeshLineMaterial from './MeshLineMaterial';
import MeshLineRaycast from './MeshLineRaycast';
class MeshLine extends THREE.Mesh {
    constructor(geometry, material) {
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
    set dashOffset(dashOffset) {
        this.material.uniforms.dashOffset.value = dashOffset;
    }
}
export { MeshLine, MeshLineGeometry, MeshLineMaterial };
//# sourceMappingURL=index.js.map