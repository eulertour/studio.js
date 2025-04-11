import {
  Geometry,
  Animation,
  StudioScene,
  AnimationRepresentation,
} from "../src/index.js";
import * as THREE from "three/webgpu";

export default class Scene implements StudioScene {
  animations?: Array<AnimationRepresentation>;
  line: Geometry.Polyline;
  square: Geometry.Square;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGPURenderer,
  ) {
    const points = [
      // new THREE.Vector3(0, 0, 0),
      // new THREE.Vector3(1, 0, 0),
      // new THREE.Vector3(1, -1, 0),
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(2, 0, 0),
      new THREE.Vector3(0, -3, 0),
    ];
    this.line = new Geometry.Polyline(points, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 1,
      strokeWidth: 10,
      fillColor: new THREE.Color("blue"),
      fillOpacity: 0.5,
      // fill: false,
    });
    // const circle = new Geometry.Circle(1.4);
    // circle.position.x = 5;
    // circle.position.y = 1.75;
    // const square = new Geometry.Square(2);
    // square.position.x = -4;
    scene.add(this.line);
    // scene.add(circle);
    // scene.add(square);

    this.animations = [
      new Animation.Animation((t) => {
        // square.restyle({
        //   strokeWidth: THREE.MathUtils.lerp(2, 6, t),
        // });
      }),
    ];
  }
}
