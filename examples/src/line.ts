import { Geometry, THREE } from '@eulertour/studio';

export default class Example {
	polyline: Geometry.Polyline;
	square: Geometry.Square;

	constructor(
		public scene,
		public camera,
		public renderer,
	) {
		// this.polyline = new Geometry.Polyline(
		// 	[
		// 		new THREE.Vector3(-1, -1, 0),
		// 		new THREE.Vector3(1, 1, 0),
		// 		new THREE.Vector3(2, 1, 0),
		// 		new THREE.Vector3(2, 0, 0),
		// 		new THREE.Vector3(3, 0, 0),
		// 		new THREE.Vector3(2, -1, 0),
		// 	],
		// 	{
		// 		// strokeWidth: 6,
		// 		strokeDashLength: 0.4,
		// 		// strokeDashOffset: 6.9,
		// 		// strokeDashOffset: 0.7,
		// 	},
		// );
		// scene.add(this.polyline);

		this.square = new Geometry.Square(2, {
			dashed: true,
			strokeDashLength: 0.2,
			// strokeDashOffset: 0.0,
		});
		scene.add(this.square);
	}

	update(dt, t) {
		if (t > 1) {
			// this.polyline.stroke.material.uniforms.dashOffset.value += dt / 2;
			// this.square.stroke.material.uniforms.dashOffset.value += dt / 2;
		}
	}
}
