import * as THREE from 'three';
import MeshLineGeometry from './MeshLineGeometry';
import MeshLineMaterial from './MeshLineMaterial';
import MeshLineRaycast from './MeshLineRaycast';

class MeshLine extends THREE.Mesh<MeshLineGeometry, MeshLineMaterial> {
	constructor(geometry: MeshLineGeometry, material: MeshLineMaterial) {
		super(geometry, material);
		this.raycast = MeshLineRaycast;
	}

	get points() {
		return this.geometry.points;
	}
}

export { MeshLine, MeshLineGeometry, MeshLineMaterial };
