import { Vector2 } from "three/webgpu";
export class ViewportManager {
    constructor() {
        Object.defineProperty(this, "_viewport", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_screenSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_devicePixelRatio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_viewportSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_viewportOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Default to undefined viewport (full screen)
        this._viewport = undefined;
        this._screenSize = new Vector2(1, 1);
        this._devicePixelRatio = 1;
        this._viewportSize = new Vector2(1, 1);
        this._viewportOffset = new Vector2(0, 0);
    }
    static getInstance() {
        if (!ViewportManager.instance) {
            ViewportManager.instance = new ViewportManager();
        }
        return ViewportManager.instance;
    }
    setViewport(viewport, screenSize, devicePixelRatio = 1) {
        this._viewport = viewport;
        this._screenSize = screenSize;
        this._devicePixelRatio = devicePixelRatio;
        // Update viewportSize and viewportOffset based on viewport
        if (this._viewport) {
            this._viewportSize.set(this._viewport.z, this._viewport.w);
            this._viewportOffset.set(this._viewport.x, this._viewport.y);
        }
        else {
            this._viewportSize.copy(this._screenSize);
            this._viewportOffset.set(0, 0);
        }
    }
    get viewport() {
        return this._viewport;
    }
    get screenSize() {
        return this._screenSize;
    }
    get devicePixelRatio() {
        return this._devicePixelRatio;
    }
    get viewportSize() {
        return this._viewportSize;
    }
    get viewportOffset() {
        return this._viewportOffset;
    }
}
//# sourceMappingURL=ViewportManager.js.map