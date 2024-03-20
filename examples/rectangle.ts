import { Geometry } from "@eulertour/studio";

export default class Example {
  constructor(
    public scene,
    public camera,
    public renderer,
  ) {
    const rectangle = new Geometry.Rectangle(4, 2);
    scene.add(rectangle);
  }
}
