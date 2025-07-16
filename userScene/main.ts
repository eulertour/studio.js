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
    public renderer: THREE.WebGLRenderer,
  ) {
    const triangle = new Geometry.Polygon(
      [
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(1, 1, 0),
        new THREE.Vector3(1, -1, 0),
      ],
      {
        strokeWidth: 4,
        fillColor: new THREE.Color("red"),
        fillOpacity: 0.5,
        strokeColor: new THREE.Color("red"),
      },
    );
    scene.add(triangle);

    this.animations = [
      new Animation.Wait(),
      new Animation.Animation((t, _) => {
        triangle.reshape([
          new THREE.Vector3(-1, -1, 0),
          new THREE.Vector3(1 + t, 1, 0),
          new THREE.Vector3(1, -1, 0),
        ]);
      }),
    ];
  }
}
