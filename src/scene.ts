import * as THREE from "three";
import { Animation } from "./animation";
import * as Geometry from "./geometry";

export default class Scene {
  animations: Array<Animation> = [];

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.WebGLRenderer
  ) {
    scene.clear();
    renderer.getSize(Geometry.GeometryResolution);
  }

  render(time: number, deltaTime: number) {}
}
