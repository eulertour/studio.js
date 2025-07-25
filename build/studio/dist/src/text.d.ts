import * as THREE from "three/webgpu";
import { type Transform } from "./geometry/index.js";
type TextStyle = {
    fillColor?: THREE.Color;
    fillOpacity?: number;
};
type TextConfig = {
    groupColoring?: Array<[number, string?]>;
    batchMaterials?: boolean;
};
declare class Text extends THREE.Group {
    text: string;
    constructor(text: string, config?: TextStyle & TextConfig);
    dispose(): void;
    clone(recursive: boolean): this;
    copy(source: this, recursive: boolean): this;
    getDimensions(): THREE.Vector2;
    getCloneAttributes(): string[];
    getAttributes(): {
        text: string;
    };
    static fromAttributes(attributes: any): Text;
    get attributeData(): {
        attribute: string;
        type: string;
        default: string;
    }[];
    toJson(): {
        className: string;
        attributes: {
            text: string;
        };
        transform: Transform;
        style: {
            fillColor: number[];
        };
    };
    static fromJson(json: any): Text;
    getTransform(): Transform;
    setTransform(transform: Transform): void;
}
export { Text };
//# sourceMappingURL=text.d.ts.map