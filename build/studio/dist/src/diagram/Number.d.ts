import * as THREE from "three/webgpu";
import * as Text from "../text.js";
export default class Number extends THREE.Group {
    static geometries: Map<string, THREE.ShapeGeometry>;
    meshes: THREE.Mesh[];
    material: THREE.MeshBasicMaterial;
    decimals: number;
    centerData: {
        center: THREE.Vector3;
        box: THREE.Box3;
        offset: THREE.Vector3;
        worldPosition: THREE.Vector3;
    };
    constructor(value?: number, config?: {
        color?: THREE.ColorRepresentation;
        decimals?: number;
    });
    reshape(value: number, config?: {
        color?: THREE.ColorRepresentation;
        decimals?: number;
    }): void;
    updateFromValue(value: number): void;
    static extractGeometry(textShape: Text.Text): THREE.ShapeGeometry;
    static initializeGeometries(): Map<string, THREE.ShapeGeometry>;
}
//# sourceMappingURL=Number.d.ts.map