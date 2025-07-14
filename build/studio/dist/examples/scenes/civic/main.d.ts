import { THREE } from "@eulertour/studio";
export default class RotatingCube {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;
    svgGroup: THREE.Group;
    textMesh: THREE.Mesh;
    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer);
    update(_deltaTime: number, _elapsedTime: number): void;
}
//# sourceMappingURL=main.d.ts.map