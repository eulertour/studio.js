import { Geometry } from "@eulertour/studio";

export default class Example {
  constructor(
    public scene,
    public camera,
    public renderer,
  ) {
    const square = new Geometry.Square(2);
    scene.add(square);
  }
}
