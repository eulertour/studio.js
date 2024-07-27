import { Geometry, THREE } from "@eulertour/studio";

export default class Example {
  constructor(
    public scene,
    public camera,
    public renderer,
  ) {
    const polyline = new Geometry.Polyline([
      new THREE.Vector3(-1, -1, 0),
      new THREE.Vector3(-1, 1, 0),
      new THREE.Vector3(1, -1, 0),
      new THREE.Vector3(1, 1, 0),
    ]);
    scene.add(polyline);
  }
}
