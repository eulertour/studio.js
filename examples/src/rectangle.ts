import { Geometry } from "@eulertour/studio";

export default class Example {
  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGLRenderer,
  ) {
    const rectangle = new Geometry.Rectangle(4, 2);
    scene.add(rectangle);
  }
}
