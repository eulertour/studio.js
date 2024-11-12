import { Geometry, THREE } from '@eulertour/studio';

export default class Example {
	constructor(
		public scene,
		public camera,
		public renderer,
	) {
		const line = new Geometry.Polyline(
			[
				new THREE.Vector3(-1, -1, 0),
				new THREE.Vector3(1, 1, 0),
				new THREE.Vector3(2, 1, 0),
				new THREE.Vector3(2, 0, 0),
			],
			{
				strokeWidth: 4,
				strokeDashLength: 0.6,
			},
		);
		scene.add(line);
	}
}
