import { Vector2, Vector4 } from "three/webgpu";

export class ViewportManager {
  private static instance: ViewportManager;
  private _viewport: Vector4 | undefined;
  private _screenSize: Vector2;
  private _devicePixelRatio: number;

  private constructor() {
    // Default to undefined viewport (full screen)
    this._viewport = undefined;
    this._screenSize = new Vector2(1, 1);
    this._devicePixelRatio = 1;
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

  // Get the actual viewport dimensions for shader calculations
  getViewportSize(): Vector2 {
    if (this._viewport) {
      return new Vector2(this._viewport.z, this._viewport.w);
    }
    return this._screenSize;
  }

  // Get the viewport offset for shader calculations
  getViewportOffset(): Vector2 {
    if (this._viewport) {
      return new Vector2(this._viewport.x, this._viewport.y);
    }
    return new Vector2(0, 0);
  }
}