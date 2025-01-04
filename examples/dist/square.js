import { Geometry } from '@eulertour/studio';
export default class Example {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        const square = new Geometry.Square(2);
        scene.add(square);
    }
}
