import { Geometry, THREE } from '@eulertour/studio';
export default class Example {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        const line = new Geometry.Line(new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0), {
            strokeWidth: 4,
        });
        scene.add(line);
    }
}
