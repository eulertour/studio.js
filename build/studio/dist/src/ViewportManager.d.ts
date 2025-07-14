import { Vector2, Vector4 } from "three/webgpu";
export declare class ViewportManager {
    private static instance;
    private _viewport;
    private _screenSize;
    private _devicePixelRatio;
    private _viewportSize;
    private _viewportOffset;
    private constructor();
    static getInstance(): ViewportManager;
    setViewport(viewport: Vector4 | undefined, screenSize: Vector2, devicePixelRatio?: number): void;
    get viewport(): Vector4 | undefined;
    get screenSize(): Vector2;
    get devicePixelRatio(): number;
    get viewportSize(): Vector2;
    get viewportOffset(): Vector2;
}
//# sourceMappingURL=ViewportManager.d.ts.map