import {
  Geometry,
  Animation,
  StudioScene,
  AnimationRepresentation,
} from "../src/index.js";
import * as THREE from "three/webgpu";

export default class Scene implements StudioScene {
  animations?: Array<AnimationRepresentation>;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGPURenderer,
  ) {
    const square = new Geometry.Square(1, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.5,
      strokeWidth: 6,
      // fillColor: new THREE.Color("red"),
      // fillOpacity: 0.5,
      // stroke: false,
    });
    square.position.setZ(-1);
    scene.add(square);

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
        //   strokeColor: new THREE.Color(t, 0, 1),
        //   strokeOpacity: 1 - t,
        // });
      }),
    ];
  }
}
