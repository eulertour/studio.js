import { THREE } from "@eulertour/studio";
export default class SVGExample {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;
    svgGroup: THREE.Group;
    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer);
    update(deltaTime: number, elapsedTime: number): void;
}
//# sourceMappingURL=svg.d.ts.map