import { Geometry, THREE } from '@eulertour/studio';

export default class Example {
	constructor(
		public scene: THREE.Scene,
		public camera: THREE.OrthographicCamera,
		public renderer: THREE.WebGLRenderer,
	) {
		const polygon = new Geometry.Polygon([
			new THREE.Vector3(-2, -1, 0),
			new THREE.Vector3(-1, 1, 0),
			new THREE.Vector3(1, 1, 0),
			new THREE.Vector3(2, -1, 0),
			new THREE.Vector3(-2, -1, 0),
		]);
		scene.add(polygon);
	}
}
