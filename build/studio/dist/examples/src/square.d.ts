import { type StudioScene, type THREE } from '@eulertour/studio';
export default class Example implements StudioScene {
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    constructor(scene: THREE.Scene, camera: THREE.OrthographicCamera, renderer: THREE.WebGLRenderer);
}
//# sourceMappingURL=square.d.ts.map