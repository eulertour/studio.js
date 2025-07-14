import { THREE } from "@eulertour/studio";
import { loadSVG, loadText } from "./utils.js";
import civicLogoSVG from './assets/CivicLogo.svg?raw';
import interBoldFont from './assets/Inter 28pt_Bold.json?raw';

export default class RotatingCube {
  svgGroup: THREE.Group;
  civicMesh: THREE.Mesh;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    this.renderer.setClearColor(0x1578CF);

    this.svgGroup = loadSVG({ content: civicLogoSVG });
    this.svgGroup.position.set(-2.3, 0.7, 1);
    this.svgGroup.scale.set(0.005, -0.005, 0.005);
    this.scene.add(this.svgGroup);

    this.civicMesh = loadText({
      fontData: interBoldFont,
      text: "Civic",
      size: 0.5,
      depth: 0.1,
      color: "white"
    });
    this.civicMesh.position.set(0.8, -0.1, -1);
    this.civicMesh.scale.set(2.0, 2.0, 2.0);
    this.scene.add(this.civicMesh);
  }

  update(_deltaTime: number, _elapsedTime: number) {
    // Rotate the SVG group
    // this.svgGroup.rotation.y += 0.5 * deltaTime;
  }
}