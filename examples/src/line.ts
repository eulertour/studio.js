import { Geometry, THREE } from '@eulertour/studio';

export default class Example {
	polyline: Geometry.Polyline;
	line: Geometry.Line;

	constructor(
		public scene,
		public camera,
		public renderer,
	) {
		this.polyline = new Geometry.Polyline(
			[
				new THREE.Vector3(-1, -1, 0),
				new THREE.Vector3(1, 1, 0),
				new THREE.Vector3(2, 1, 0),
				new THREE.Vector3(2, 0, 0),
				new THREE.Vector3(3, 0, 0),
				new THREE.Vector3(2, -1, 0),
			],
			{
				strokeWidth: 6,
				strokeDashLength: 0.4,
				// strokeDashOffset: 6.9,
				// strokeDashOffset: 0.7,
			},
		);
		scene.add(this.polyline);

		this.line = new Geometry.Line(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
		scene.add(this.line);
	}

	update(dt, t) {
		if (t > 1) {
			this.polyline.stroke.material.uniforms.dashOffset.value += dt / 2;
		}
	}
}
