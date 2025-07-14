import { Geometry, type StudioScene, type THREE, Text } from '@eulertour/studio';
declare class LabeledSquare extends Geometry.Square {
    labelScale: number;
    accessor label: Text.Text;
    constructor(sideLength: number);
}
export default class Example implements StudioScene {
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    square: LabeledSquare;
    revealInterval: number;
    lastRevealTime: number;
    constructor(scene: THREE.Scene, camera: THREE.OrthographicCamera, renderer: THREE.WebGLRenderer);
    update(_: number, t: number): void;
}
export {};
//# sourceMappingURL=componentDecorator.d.ts.map