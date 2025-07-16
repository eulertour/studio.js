import { Vector2, Vector4 } from "three/webgpu";

export class ViewportManager {
  private static instance: ViewportManager;
  private _viewport: Vector4 | undefined;
  private _screenSize: Vector2;
  private _devicePixelRatio: number;
  private _viewportSize: Vector2;
  private _viewportOffset: Vector2;

  private constructor() {
    // Default to undefined viewport (full screen)
    this._viewport = undefined;
    this._screenSize = new Vector2(1, 1);
    this._devicePixelRatio = 1;
    this._viewportSize = new Vector2(1, 1);
    this._viewportOffset = new Vector2(0, 0);
  }

  static getInstance(): ViewportManager {
    if (!ViewportManager.instance) {
      ViewportManager.instance = new ViewportManager();
    }
    return ViewportManager.instance;
  }

  setViewport(viewport: Vector4 | undefined, screenSize: Vector2, devicePixelRatio: number = 1) {
    this._viewport = viewport;
    this._screenSize = screenSize;
    this._devicePixelRatio = devicePixelRatio;
    
    // Update viewportSize and viewportOffset based on viewport
    if (this._viewport) {
      this._viewportSize.set(this._viewport.z, this._viewport.w);
      this._viewportOffset.set(this._viewport.x, this._viewport.y);
    } else {
      this._viewportSize.copy(this._screenSize);
      this._viewportOffset.set(0, 0);
    }
  }

  get viewport(): Vector4 | undefined {
    return this._viewport;
  }

  get screenSize(): Vector2 {
    return this._screenSize;
  }

  get devicePixelRatio(): number {
    return this._devicePixelRatio;
  }

  get viewportSize(): Vector2 {
    return this._viewportSize;
  }

  get viewportOffset(): Vector2 {
    return this._viewportOffset;
  }
}