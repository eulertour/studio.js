import { Geometry, THREE } from '@eulertour/studio';
export default class Example {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        const polygon = new Geometry.Polygon([
            new THREE.Vector3(-2, -1, 0),
            new THREE.Vector3(-1, 1, 0),
            new THREE.Vector3(1, 1, 0),
            new THREE.Vector3(2, -1, 0),
            new THREE.Vector3(-2, -1, 0),
        ]);
        scene.add(polygon);
    }
}
