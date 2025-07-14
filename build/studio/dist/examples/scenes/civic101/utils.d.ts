import { THREE } from "@eulertour/studio";
interface SVGLoaderOptions {
    content: string;
    center?: boolean;
}
interface TextLoaderOptions {
    fontData: string;
    text: string;
    size?: number;
    depth?: number;
    color?: string | number;
}
export declare function loadSVG(options: SVGLoaderOptions): THREE.Group;
export declare function loadText(options: TextLoaderOptions): THREE.Mesh;
export declare const createRightEdgeFadeAlphaMap: (width: any, height: any, fadePercentage?: number) => THREE.CanvasTexture;
export {};
//# sourceMappingURL=utils.d.ts.map