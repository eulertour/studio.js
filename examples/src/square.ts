import { Geometry, type StudioScene, type THREE } from '@eulertour/studio';

export default class Example implements StudioScene {
	constructor(
		public scene: THREE.Scene,
		public camera: THREE.OrthographicCamera,
		public renderer: THREE.WebGLRenderer,
	) {
		const square = new Geometry.Square(2);
		scene.add(square);
	}
}
