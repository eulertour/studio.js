"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const studio_1 = require("@eulertour/studio");
class Example {
    constructor(scene, camera, renderer) {
        Object.defineProperty(this, "scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: scene
        });
        Object.defineProperty(this, "camera", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: camera
        });
        Object.defineProperty(this, "renderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: renderer
        });
        Object.defineProperty(this, "animations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Data referenced in both constructor() and update() should
        // be saved to instance variables.
        Object.defineProperty(this, "square", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "circle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "welcome", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // It's often better to keep parameters that need to
        // be tweaked in one place, especially if they're
        // used more than once.
        Object.defineProperty(this, "squareSideLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1.4
        });
        Object.defineProperty(this, "circleRadius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.8
        });
        Object.defineProperty(this, "labelScale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.65
        });
        // This line instantiates a Square. Note that it won't be
        // visible until it's added to the scene.
        this.square = new studio_1.Geometry.Square(this.squareSideLength);
        // This block creates, scales, and positions a Text object
        // before adding it as a child of this.square.
        const squareLabel = new studio_1.Text.Text('\\substack{\\text{This shape is animated} \\\\ \\text{using this.animations}}');
        squareLabel.setScale(this.labelScale);
        squareLabel.moveAbove(this.square);
        this.square.add(squareLabel);
        // Since squareLabel is a child of this.square, it appears
        // in the scene when this.square is added.
        this.square.position.set(-4, -2, 0);
        this.square.rotation.set(0, 0, Math.PI / 4);
        scene.add(this.square);
        // this.circle = new Geometry.Circle(this.circleRadius);
        this.circle = new studio_1.Geometry.Line(new studio_1.THREE.Vector3(-1, 0, 0), new studio_1.THREE.Vector3(1, 0, 0));
        // The circleLabel is handled similarly to squareLabel.
        const circleLabel = new studio_1.Text.Text('\\substack{\\text{This shape is animated} \\\\ \\text{using this.loop}}');
        circleLabel.setScale(this.labelScale);
        circleLabel.moveAbove(this.circle);
        this.circle.add(circleLabel);
        this.circle.position.set(3.5, -1, 0);
        scene.add(this.circle);
        this.welcome = new studio_1.Text.Text('\\textrm{Welcome to EulerStudio!}');
        this.welcome.position.y = 3;
        scene.add(this.welcome);
        // Each animation added to this.animations is executed sequentially. Each
        // animation lasts 1 second by default.
        this.animations = [
            new studio_1.Animation.Shift(this.square, new studio_1.THREE.Vector3(0, 2, 0)),
            new studio_1.Animation.Shift(this.square, new studio_1.THREE.Vector3(2, 0, 0)),
            new studio_1.Animation.Shift(this.square, new studio_1.THREE.Vector3(0, -2, 0)),
            new studio_1.Animation.Shift(this.square, new studio_1.THREE.Vector3(-2, 0, 0)),
            new studio_1.Animation.Shift(this.square, new studio_1.THREE.Vector3(1, 1, 0)),
        ];
    }
    // this.update() is called before each render (except the very first).
    // This usually means that it's called 60 times per second, but it
    // will vary depending on your display settings.
    update(deltaTime, time) {
        this.welcome.position.x = 6 - (6 / 5) * time;
        this.circle.position.x = 3.5 + Math.cos(-2 * time);
        this.circle.position.y = -1 + Math.sin(-2 * time);
    }
}
exports.default = Example;
//# sourceMappingURL=basic.js.map