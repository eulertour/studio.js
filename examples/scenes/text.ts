import { THREE } from "../../src/index.ts";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TTFLoader } from "three/examples/jsm/Addons.js";

export default class Example {
  textMesh: THREE.Mesh;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    const loader = new FontLoader();
    loader.load("/examples/html/assets/Inter 28pt_Bold.json", (font) => {
      const geometry = new TextGeometry("hello", {
        font: font,
        size: 0.5,
        depth: 0.1,
        curveSegments: 12,
        bevelEnabled: false,
      });
      
      const material = new THREE.MeshBasicMaterial({ color: "black" });
      this.textMesh = new THREE.Mesh(geometry, material);
      
      geometry.center();
      
      this.textMesh.scale.set(3, 3, 3);
      
      this.scene.add(this.textMesh);
    });
  }

  update(dt: number) {
  }
}
