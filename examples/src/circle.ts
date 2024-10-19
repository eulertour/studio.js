import { Geometry } from '@eulertour/studio';

export default class Example {
	constructor(
		public scene,
		public camera,
		public renderer,
	) {
		const circle = new Geometry.Circle(2);
		scene.add(circle);
	}
}
