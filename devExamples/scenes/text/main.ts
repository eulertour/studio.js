import { THREE } from "@eulertour/studio";
import { loadText } from "./utils";
import interBoldFont from './assets/Inter 28pt_Bold.json?raw';

export default class Example {
  textMesh: THREE.Mesh;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    this.textMesh = loadText({
      fontData: interBoldFont,
      text: "hello",
      size: 0.5,
      depth: 0.1,
      color: "black"
    });
    
    this.textMesh.scale.set(3, 3, 3);
    
    this.scene.add(this.textMesh);
  }

  update(dt: number) {
  }
}