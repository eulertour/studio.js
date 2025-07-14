import { THREE } from "@eulertour/studio";
export default class Example {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;
    textMesh: THREE.Mesh;
    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer);
    update(dt: number): void;
}
//# sourceMappingURL=text.d.ts.map