import { Geometry, THREE } from '@eulertour/studio';
export default class Example {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        const point = new Geometry.Point(new THREE.Vector3(-1, 1, 0));
        scene.add(point);
    }
}
