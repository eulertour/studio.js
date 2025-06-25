import { Geometry, Animation, Text, THREE } from "../src/index.ts";

export default class Example {
  square: Geometry.Square;
  circle: Geometry.Circle;
  text: Text.Text;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    this.square = new Geometry.Square(1);
    scene.add(this.square);

    this.circle = new Geometry.Circle(1);
    scene.add(this.circle);

    this.text = new Text.Text("hello");
    scene.add(this.text);

    this.animations = [
      new Animation.SetScale(this.square, 2),
      new Animation.Animation(
        (t) => {
          this.circle.restyle({
            strokeOpacity: t,
          });
        },
        {
          before: () => {
            this.scene.add(this.circle);
          },
        },
      ),
    ];
  }

  update(dt: number) {
    this.square.rotation.z += Math.PI * dt;
    this.square.position.x += dt;
  }
}
