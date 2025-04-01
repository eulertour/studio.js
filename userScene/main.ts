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
    const line = new Geometry.WebGPUMeshLine([
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(2, 1, 0),
      new THREE.Vector3(-1, 0, 0),
    ]);
    scene.add(line);

    this.animations = [
      new Animation.Animation((t) => {
        line.reshape([
          new THREE.Vector3(-1, 0, 0),
          new THREE.Vector3(1 + t, 0, 0),
          new THREE.Vector3(2, 1, 0),
          new THREE.Vector3(-1, 0, 0),
        ]);
      }),
    ];
  }
}
