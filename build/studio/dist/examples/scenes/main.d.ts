import { Geometry, Text, THREE } from "@eulertour/studio";
export default class Example {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;
    square: Geometry.Square;
    circle: Geometry.Circle;
    text: Text.Text;
    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer);
    update(dt: number): void;
}
//# sourceMappingURL=main.d.ts.map