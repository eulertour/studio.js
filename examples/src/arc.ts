import { Geometry } from "@eulertour/studio";

export default class Example {
  constructor(
    public scene,
    public camera,
    public renderer,
  ) {
    const arc = new Geometry.Arc(2, (3 / 4) * Math.PI);
    scene.add(arc);
  }
}
