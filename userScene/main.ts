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
    const line = new Geometry.WebGPULine(
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(1, 0, 0),
    );
    scene.add(line);
  }
}
