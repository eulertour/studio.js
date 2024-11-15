import { Geometry, THREE } from '@eulertour/studio';

export default class Example {
	line: Geometry.Polyline;

	constructor(
		public scene,
		public camera,
		public renderer,
	) {
		this.line = new Geometry.Polyline(
			[
				new THREE.Vector3(-1, -1, 0),
				new THREE.Vector3(1, 1, 0),
				new THREE.Vector3(2, 1, 0),
				new THREE.Vector3(2, 0, 0),
				new THREE.Vector3(3, 0, 0),
				new THREE.Vector3(2, -1, 0),
			],
			{
				strokeWidth: 8,
				strokeDashLength: 0.4,
				// strokeDashOffset: 6.9,
				strokeDashOffset: 0.7,
			},
		);
		scene.add(this.line);
	}

	update(dt, t) {
		if (t > 1) {
			this.line.stroke.material.uniforms.dashOffset.value += dt / 2;
		}
	}
}
