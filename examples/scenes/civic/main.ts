import { THREE } from "../../../src/index.js";
import { loadSVG, loadText } from "./loaders.js";

export default class RotatingCube {
  svgGroup: THREE.Group;
  textMesh: THREE.Mesh;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    this.renderer.setClearColor(0x1578CF);

    // Load the SVG
    loadSVG({
      url: '/examples/html/assets/CivicLogo.svg',
      scene: this.scene,
      position: new THREE.Vector3(-2, 0, 0),
      scale: new THREE.Vector3(0.006, -0.006, 0.006),
      center: true
    }).then((svgGroup) => {
      this.svgGroup = svgGroup;
    });

    // Load the font and create text
    loadText({
      url: "/examples/html/assets/Inter 28pt_Bold.json",
      scene: this.scene,
      text: "Civic",
      size: 0.5,
      depth: 0.1,
      position: new THREE.Vector3(0.9, -0.1, 0),
      scale: new THREE.Vector3(2.2, 2.2, 2.2),
      color: "white"
    }).then((textMesh) => {
      this.textMesh = textMesh;
    });
  }

  update(_deltaTime: number, _elapsedTime: number) {
    // Rotate the SVG group
    // this.svgGroup.rotation.y += 0.5 * deltaTime;
  }
}