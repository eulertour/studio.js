import {
	Animation, // EulerStudio Animations
	type AnimationRepresentation, // A union of animation formats that can be added to this.animations
	Geometry, // EulerStudio Shapes
	type StudioScene, // An interface that all scenes must implement
	THREE, // The three.js library
	Text, // EulerStudio Text
} from '@eulertour/studio';

export default class Example implements StudioScene {
	animations: Array<AnimationRepresentation>;

	// Data referenced in both constructor() and update() should
	// be saved to instance variables.
	square: Geometry.Square;
	circle: Geometry.Circle;
	welcome: Text.Text;

	// It's often better to keep parameters that need to
	// be tweaked in one place, especially if they're
	// used more than once.
	squareSideLength = 1.4;
	circleRadius = 0.8;
	labelScale = 0.65;

	constructor(
		public scene,
		public camera,
		public renderer,
	) {
		// This line instantiates a Square. Note that it won't be
		// visible until it's added to the scene.
		this.square = new Geometry.Square(this.squareSideLength);

		// This block creates, scales, and positions a Text object
		// before adding it as a child of this.square.
		const squareLabel = new Text.Text(
			'\\substack{\\text{This shape is animated} \\\\ \\text{using this.animations}}',
		);
		squareLabel.setScale(this.labelScale);
		squareLabel.moveAbove(this.square);
		this.square.add(squareLabel);

		// Since squareLabel is a child of this.square, it appears
		// in the scene when this.square is added.
		this.square.position.set(-4, -2, 0);
		this.square.rotation.set(0, 0, Math.PI / 4);
		scene.add(this.square);

		// this.circle = new Geometry.Circle(this.circleRadius);
		this.circle = new Geometry.Line(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0));

		// The circleLabel is handled similarly to squareLabel.
		const circleLabel = new Text.Text(
			'\\substack{\\text{This shape is animated} \\\\ \\text{using this.loop}}',
		);
		circleLabel.setScale(this.labelScale);
		circleLabel.moveAbove(this.circle);
		this.circle.add(circleLabel);

		this.circle.position.set(3.5, -1, 0);
		scene.add(this.circle);

		this.welcome = new Text.Text('\\textrm{Welcome to EulerStudio!}');
		this.welcome.position.y = 3;
		scene.add(this.welcome);

		// Each animation added to this.animations is executed sequentially. Each
		// animation lasts 1 second by default.
		this.animations = [
			new Animation.Shift(this.square, new THREE.Vector3(0, 2, 0)),
			new Animation.Shift(this.square, new THREE.Vector3(2, 0, 0)),
			new Animation.Shift(this.square, new THREE.Vector3(0, -2, 0)),
			new Animation.Shift(this.square, new THREE.Vector3(-2, 0, 0)),
			new Animation.Shift(this.square, new THREE.Vector3(1, 1, 0)),
		];
	}

	// this.update() is called before each render (except the very first).
	// This usually means that it's called 60 times per second, but it
	// will vary depending on your display settings.
	update(deltaTime: number, time: number) {
		this.welcome.position.x = 6 - (6 / 5) * time;

		this.circle.position.x = 3.5 + Math.cos(-2 * time);
		this.circle.position.y = -1 + Math.sin(-2 * time);
	}
}
