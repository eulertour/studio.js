import THREE from "../three.js";
export declare const CameraDimensions: THREE.Vector2;
export declare const setCameraDimensions: (camera: THREE.OrthographicCamera) => void;
export declare const CanvasViewport: THREE.Vector4;
export declare const setCanvasViewport: (viewport: THREE.Vector4) => void;
export default class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters: THREE.ShaderMaterialParameters & {
        color: THREE.ColorRepresentation;
        opacity: number;
        width: number;
        dashLength: number;
        dashOffset: number;
    });
    get color(): any;
    set color(value: any);
    get width(): number;
    set width(value: number);
    get totalLength(): any;
    set totalLength(value: any);
    get dashLength(): any;
    set dashLength(value: any);
    get dashOffset(): any;
    set dashOffset(value: any);
}
//# sourceMappingURL=MeshLineMaterial.d.ts.map