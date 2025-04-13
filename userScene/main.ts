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
    const circle = new Geometry.Circle(2, {
      strokeColor: new THREE.Color("orange"),
      strokeOpacity: 0.5,
      strokeWidth: 4,
      strokeDashLength: 2 * Math.PI / 6,
      strokeDashSpeed: 1,
    });
    circle.position.x = 4;
    circle.position.y = 1.5;
    scene.add(circle);
    this.animations = [
      new Animation.Animation((t) => {
        circle.restyle({
          strokeColor: new THREE.Color(1 - t, 0.5 - 0.5 * t, 0),
          strokeWidth: 4 + 2 * t,
          strokeDashLength: 2 * Math.PI / (6 + t),
        });
      }),
    ];

    // const square = new Geometry.Square(2, {
    //   strokeOpacity: 0.75,
    //   strokeWidth: 5,
    // });
    // square.position.x = -4;
    // scene.add(square);

    // const points = [
    //   // new THREE.Vector3(0, 0, 0),
    //   // new THREE.Vector3(1, 0, 0),
    //   // new THREE.Vector3(1, -1, 0),
    //   new THREE.Vector3(-2, 0, 0),
    //   new THREE.Vector3(2, 0, 0),
    //   new THREE.Vector3(0, -3, 0),
    // ];
    // this.line = new Geometry.Polyline(points, {
    //   strokeColor: new THREE.Color("blue"),
    //   strokeOpacity: 0.5,
    //   strokeWidth: 4,
    //   strokeDashLength: 1,
    //   fillColor: new THREE.Color("blue"),
    //   fillOpacity: 0.5,
    //   // fill: false,
    // });
    // scene.add(this.line);
    // this.animations = [
    //   new Animation.Animation((t) => {
    //     this.line.reshape([
    //       new THREE.Vector3(-2, 0, 0),
    //       new THREE.Vector3(2 + t, t, 0),
    //       new THREE.Vector3(0, -3, 0),
    //     ]);
    //   }),
    //   new Animation.Animation((t) => {
    //     this.line.reshape([
    //       new THREE.Vector3(-2 - t, t, 0),
    //       new THREE.Vector3(3, 1, 0),
    //       new THREE.Vector3(0, -3, 0),
    //     ]);
    //   }),
    //   new Animation.Animation((t) => {
    //     this.line.reshape([
    //       new THREE.Vector3(-3 + 2 * t, 1 + t, 0),
    //       new THREE.Vector3(3, 1, 0),
    //       new THREE.Vector3(0, -3, 0),
    //     ]);
    //   }),
    //   new Animation.Animation((t) => {
    //     this.line.reshape([
    //       new THREE.Vector3(-1 + 3 * t, 2, 0),
    //       new THREE.Vector3(3 - 3 * t, 1, 0),
    //       new THREE.Vector3(3 * t, -3, 0),
    //     ]);
    //   }),
    // ];
  }
}
