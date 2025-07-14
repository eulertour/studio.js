import { Geometry, Animation, Text } from "@eulertour/studio";
export default class Example {
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
        Object.defineProperty(this, "text", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.square = new Geometry.Square(1);
        scene.add(this.square);
        this.circle = new Geometry.Circle(1);
        scene.add(this.circle);
        this.text = new Text.Text("hello");
        scene.add(this.text);
        this.animations = [
            new Animation.SetScale(this.square, 2),
            new Animation.Animation((t) => {
                this.circle.restyle({
                    strokeOpacity: t,
                });
            }, {
                before: () => {
                    this.scene.add(this.circle);
                },
            }),
        ];
    }
    update(dt) {
        this.square.rotation.z += Math.PI * dt;
        this.square.position.x += dt;
    }
}
//# sourceMappingURL=main.js.map