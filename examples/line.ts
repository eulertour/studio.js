import { Geometry, THREE } from "@eulertour/studio";

export default class Example {
  constructor(
    public scene,
    public camera,
    public renderer,
  ) {
    const line = new Geometry.Line(
      new THREE.Vector3(-1, -1, 0),
      new THREE.Vector3(1, 1, 0),
    );
    scene.add(line);
  }
}
