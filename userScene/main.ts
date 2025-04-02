import {
  Geometry,
  Animation,
  StudioScene,
  AnimationRepresentation,
} from "../src/index.js";
import * as THREE from "three/webgpu";

export default class Scene implements StudioScene {
  animations?: Array<AnimationRepresentation>;
  square: Geometry.Square;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGPURenderer,
  ) {
    // const p1 = new Geometry.Point(new THREE.Vector2(0, 1), { stroke: false });
    // const p2 = new Geometry.Point(new THREE.Vector2(1, 1), { stroke: false });
    // scene.add(p1, p2);

    this.square = new Geometry.Square(2, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 1,
      strokeWidth: 4,
      fillColor: new THREE.Color("blue"),
      fillOpacity: 0.5,
    });
    this.square.rotation.y = 0;
    scene.add(this.square);

    // const square2 = new Geometry.Square(1, {
    //   // strokeColor: new THREE.Color("blue"),
    //   // strokeOpacity: 1.0,
    //   // strokeWidth: 6,
    //   fillColor: new THREE.Color("red"),
    //   fillOpacity: 0.5,
    //   stroke: false,
    // });
    // square2.position.setZ(1);
    // scene.add(square2);

    this.animations = [
      new Animation.Animation((t) => {
        // square.restyle({
        //   strokeWidth: THREE.MathUtils.lerp(2, 6, t),
        // });
      }),
    ];
  }

  update(dt, t) {
    // this.square.rotation.y += dt;
  }
}
