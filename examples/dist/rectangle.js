import { Geometry } from '@eulertour/studio';
export default class Example {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        const rectangle = new Geometry.Rectangle(4, 2);
        scene.add(rectangle);
    }
}
