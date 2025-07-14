import { // EulerStudio Animations
type AnimationRepresentation, // A union of animation formats that can be added to this.animations
Geometry, // EulerStudio Shapes
type StudioScene, // The three.js library
Text } from '@eulertour/studio';
export default class Example implements StudioScene {
    scene: any;
    camera: any;
    renderer: any;
    animations: Array<AnimationRepresentation>;
    square: Geometry.Square;
    circle: Geometry.Circle;
    welcome: Text.Text;
    squareSideLength: number;
    circleRadius: number;
    labelScale: number;
    constructor(scene: any, camera: any, renderer: any);
    update(deltaTime: number, time: number): void;
}
//# sourceMappingURL=basic.d.ts.map