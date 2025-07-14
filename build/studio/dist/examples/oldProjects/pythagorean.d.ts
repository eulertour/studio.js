import { Diagram, Geometry, type StudioScene, THREE } from '@eulertour/studio';
export default class Example implements StudioScene {
    scene: any;
    camera: any;
    renderer: any;
    s: number;
    a: number;
    b: number;
    labelOffset: number;
    labelScale: number;
    triangles: Geometry.Polygon[];
    animations: never[];
    indicator: Diagram.Indicator;
    indicatorOffset: number;
    indicatorLabelOffset: number;
    triangleLabels: Array<THREE.Group>;
    diagram: THREE.Group<THREE.Object3DEventMap>;
    equations: THREE.Group;
    smallSquareShade: Geometry.Polygon;
    constructor(scene: any, camera: any, renderer: any);
    animateSquare(): void;
    animateArea(): void;
    getLabels(triangle: Geometry.Polygon): THREE.Group;
}
//# sourceMappingURL=pythagorean.d.ts.map