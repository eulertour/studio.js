# Singleton Viewport Implementation Specification

## Problem Statement

The WebGPUMeshLine shaders (Vertex.ts and Fragment.ts) need access to viewport information from SceneController when a viewport is defined. Currently, the shaders use `screenSize` from Three.js TSL which represents the full canvas dimensions, not the specific viewport area.

The challenge is that:
1. SceneController and shapes are created separately with no direct connection
2. Shapes can be dynamically added/removed from the scene graph
3. Scene graph traversal cannot guarantee reaching all shapes

## Solution Overview

Implement a hybrid singleton-uniform approach where:
1. A ViewportManager singleton stores the current viewport state
2. WebGPUMeshLine uniforms include a viewport property that reads from the singleton
3. SceneController updates the singleton when viewport changes
4. Shaders use the viewport uniform instead of screenSize

## Architecture Design

```
┌─────────────────┐     ┌────────────────────┐
│ SceneController │────▶│  ViewportManager   │
└─────────────────┘     │   (Singleton)      │
                        │ - viewport: Vector4 │
                        │ - screenSize: Vec2  │
                        └───────┬────────────┘
                                │
                        ┌───────▼────────────┐
                        │  Uniforms Type     │
                        │ viewport: Uniform  │
                        └───────┬────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼─────┐         ┌───────▼─────┐
            │VertexShader │         │FragmentShader│
            └─────────────┘         └─────────────┘
```

## Implementation Steps

### 1. Create ViewportManager Singleton

**File**: `src/ViewportManager.ts`

```typescript
import { Vector2, Vector4 } from "three/webgpu";

export class ViewportManager {
  private static instance: ViewportManager;
  private _viewport: Vector4 | undefined;
  private _screenSize: Vector2;

  private constructor() {
    // Default to undefined viewport (full screen)
    this._viewport = undefined;
    this._screenSize = new Vector2(1, 1);
  }

  static getInstance(): ViewportManager {
    if (!ViewportManager.instance) {
      ViewportManager.instance = new ViewportManager();
    }
    return ViewportManager.instance;
  }

  setViewport(viewport: Vector4 | undefined, screenSize: Vector2) {
    this._viewport = viewport;
    this._screenSize = screenSize;
  }

  get viewport(): Vector4 | undefined {
    return this._viewport;
  }

  get screenSize(): Vector2 {
    return this._screenSize;
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
```

### 2. Update Uniforms Type

**File**: `src/geometry/WebGPUMeshLine/index.ts`

Add to the Uniforms type:
```typescript
export type Uniforms = {
  // ... existing uniforms ...
  viewport: THREE.UniformNode<THREE.Vector4>;
  viewportSize: THREE.UniformNode<THREE.Vector2>;
  viewportOffset: THREE.UniformNode<THREE.Vector2>;
};
```

### 3. Initialize Viewport Uniforms

**File**: `src/geometry/WebGPUMeshLine/index.ts`

In the WebGPUMeshLine constructor where uniforms are created:
```typescript
import { ViewportManager } from "../../ViewportManager.js";

// In the uniforms initialization section:
const viewportManager = ViewportManager.getInstance();
const uniforms: Uniforms = {
  // ... existing uniforms ...
  viewport: uniform(viewportManager.viewport || new THREE.Vector4(0, 0, 1, 1)),
  viewportSize: uniform(viewportManager.getViewportSize()),
  viewportOffset: uniform(viewportManager.getViewportOffset()),
};
```

### 4. Update WebGPUMeshLineMaterial

**File**: `src/geometry/WebGPUMeshLine/Material.ts`

Pass viewport uniforms to shaders:
```typescript
this.vertexNode = new VertexShader(
  // ... existing parameters ...
  this.uniforms.viewportSize,
  this.uniforms.viewportOffset,
).node();

this.fragmentNode = new FragmentShader(
  // ... existing parameters ...
  this.uniforms.viewportSize,
  this.uniforms.viewportOffset,
).node();
```

### 5. Update VertexShader

**File**: `src/geometry/WebGPUMeshLine/shaders/Vertex.ts`

1. Add viewport parameters to constructor:
```typescript
constructor(
  // ... existing parameters ...
  viewportSize: UniformNode<Vector2>,
  viewportOffset: UniformNode<Vector2>,
) {
```

2. Replace `screenSize` usage with `viewportSize` in the shader:
   - In `viewportTransform` function (line ~40)
   - Any other places using `screenSize`

### 6. Update FragmentShader

**File**: `src/geometry/WebGPUMeshLine/shaders/Fragment.ts`

1. Add viewport parameters to constructor:
```typescript
constructor(
  // ... existing parameters ...
  viewportSize: UniformNode<Vector2>,
  viewportOffset: UniformNode<Vector2>,
) {
```

2. Update `glFragCoord` function to account for viewport offset:
```typescript
const glFragCoord = Fn(() => {
  const coord = vec2(screenCoordinate.x, screenSize.y.sub(screenCoordinate.y));
  return coord.sub(viewportOffset);
});
```

3. Replace `screenSize` with `viewportSize` throughout the shader

### 7. Update SceneController

**File**: `src/scene.ts`

1. Import ViewportManager:
```typescript
import { ViewportManager } from "./ViewportManager.js";
```

2. In constructor, after setting viewport:
```typescript
constructor(
  public UserScene: StudioSceneClass,
  canvasRef: HTMLCanvasElement,
  config: SceneCanvasConfig,
) {
  this.viewport = config.viewport;
  this.aspectRatio = config.aspectRatio;
  this.userScene = new UserScene(...setupCanvas(canvasRef, config));
  
  // Update ViewportManager with initial viewport
  const screenSize = new THREE.Vector2(
    canvasRef.width,
    canvasRef.height
  );
  ViewportManager.getInstance().setViewport(this.viewport, screenSize);
}
```

3. Add a method to update viewport:
```typescript
setViewport(viewport: THREE.Vector4 | undefined) {
  this.viewport = viewport;
  const canvas = this.renderer.domElement;
  const screenSize = new THREE.Vector2(canvas.width, canvas.height);
  ViewportManager.getInstance().setViewport(viewport, screenSize);
}
```

### 8. Update WebGPUMeshLine update cycle

**File**: `src/geometry/WebGPUMeshLine/index.ts`

Add an update method to sync viewport uniforms:
```typescript
update(dt: number) {
  // ... existing update logic ...
  
  // Update viewport uniforms from singleton
  const viewportManager = ViewportManager.getInstance();
  if (viewportManager.viewport) {
    this.uniforms.viewport.value = viewportManager.viewport;
  }
  this.uniforms.viewportSize.value = viewportManager.getViewportSize();
  this.uniforms.viewportOffset.value = viewportManager.getViewportOffset();
}
```

## Testing Considerations

1. Test with viewport undefined (full screen rendering)
2. Test with viewport defined (partial screen rendering)
3. Test viewport changes during runtime
4. Test shapes added after viewport is set
5. Test shapes removed and re-added to scene

## Migration Notes

1. The change is backward compatible - if no viewport is set, shaders use full screen size
2. Existing code continues to work without modification
3. ViewportManager singleton is lazy-initialized, so no startup cost
4. Viewport uniforms automatically sync on each frame through the update cycle

## Future Enhancements

1. Add viewport change events for more efficient updates
2. Support per-shape viewport overrides if needed
3. Add viewport animation support