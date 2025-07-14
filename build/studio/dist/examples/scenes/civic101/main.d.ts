import { THREE } from "@eulertour/studio";
export default class RotatingCube {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;
    svgGroup: THREE.Group;
    civicMesh: THREE.Mesh;
    numberMesh: THREE.Mesh;
    mask: THREE.Mesh;
    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer);
    update(deltaTime: number, elapsedTime: number): void;
}
//# sourceMappingURL=main.d.ts.map