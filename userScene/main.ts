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
      // fillColor: new THREE.Color("red"),
      // fillOpacity: 1,
      // stroke: false,
    });
    scene.add(square);

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
