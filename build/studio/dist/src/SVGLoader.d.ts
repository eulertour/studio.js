import * as THREE from "three/webgpu";
declare class SVGLoader extends THREE.Loader {
    constructor(manager: any);
    load(url: any, onLoad: any, onProgress: any, onError: any): void;
    parse(text: any): {
        paths: any[];
        xml: import("@xmldom/xmldom").Element | null;
    };
    static createShapes(shapePath: any): any[];
    static getStrokeStyle(width: any, color: any, lineJoin: any, lineCap: any, miterLimit: any): {
        strokeColor: any;
        strokeWidth: any;
        strokeLineJoin: any;
        strokeLineCap: any;
        strokeMiterLimit: any;
    };
    static pointsToStroke(points: any, style: any, arcDivisions: any, minDistance: any): THREE.BufferGeometry<THREE.NormalBufferAttributes> | null;
    static pointsToStrokeWithBuffers(points: any, style: any, arcDivisions: any, minDistance: any, vertices: any, normals: any, uvs: any, vertexOffset: any): number;
}
export { SVGLoader };
//# sourceMappingURL=SVGLoader.d.ts.map