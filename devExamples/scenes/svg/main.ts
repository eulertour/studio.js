import { THREE } from "@eulertour/studio";
import { loadSVG } from "./utils";
import testSVG from './assets/test.svg?raw';

export default class SVGExample {
  svgGroup: THREE.Group;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    // Create and configure the SVG group
    this.svgGroup = loadSVG({ 
      content: testSVG,
    });
    
    
    // Flip vertically to match the original orientation
    this.svgGroup.scale.set(1, -1, 1);
    this.svgGroup.position.set(-3, 2.8, 0);
    
    this.scene.add(this.svgGroup);
  }

  update(deltaTime: number, elapsedTime: number) {
    // The SVG remains static
  }
}