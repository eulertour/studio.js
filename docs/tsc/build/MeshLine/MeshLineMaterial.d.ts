import * as THREE from "three";
import type { ShaderMaterialParameters } from "three";
export declare const CameraDimensions: THREE.Vector2;
export declare const setCameraDimensions: (camera: THREE.OrthographicCamera) => void;
export declare const CanvasViewport: THREE.Vector4;
export declare const setCanvasViewport: (viewport: THREE.Vector4) => void;
export default class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters: ShaderMaterialParameters & {
        color: THREE.ColorRepresentation;
        opacity: number;
        width: number;
    });
    get color(): any;
    set color(value: any);
    get width(): number;
    set width(value: number);
}
