import { Geometry } from '@eulertour/studio';
export default class Example {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        const arc = new Geometry.Arc(2, (3 / 4) * Math.PI);
        scene.add(arc);
    }
}
