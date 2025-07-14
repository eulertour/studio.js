import { THREE } from "../../../src/index.js";
interface LoaderOptions {
    url: string;
    scene: THREE.Scene;
    onProgress?: (progress: ProgressEvent) => void;
}
interface SVGLoaderOptions extends LoaderOptions {
    scale?: THREE.Vector3;
    position?: THREE.Vector3;
    center?: boolean;
}
interface TextLoaderOptions extends LoaderOptions {
    text: string;
    size?: number;
    depth?: number;
    position?: THREE.Vector3;
    scale?: THREE.Vector3;
    color?: string | number;
}
export declare function loadSVG(options: SVGLoaderOptions): Promise<THREE.Group>;
export declare function loadText(options: TextLoaderOptions): Promise<THREE.Mesh>;
export {};
//# sourceMappingURL=loaders.d.ts.map