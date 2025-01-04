import { Geometry } from '@eulertour/studio';
export default class Example {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        const circle = new Geometry.Circle(2);
        scene.add(circle);
    }
}
