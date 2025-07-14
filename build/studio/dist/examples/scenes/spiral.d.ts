import { Geometry, StudioScene, AnimationRepresentation } from "@eulertour/studio";
import * as THREE from "three/webgpu";
export default class Scene implements StudioScene {
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGPURenderer;
    animations?: Array<AnimationRepresentation>;
    line: Geometry.Polyline;
    square: Geometry.Square;
    constructor(scene: THREE.Scene, camera: THREE.OrthographicCamera, renderer: THREE.WebGPURenderer);
    update(dt: any, t: any): void;
}
//# sourceMappingURL=spiral.d.ts.map