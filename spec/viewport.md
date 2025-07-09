# Viewport Rendering Behavior Update Specification

## Problem Analysis
Currently, when a viewport is passed, the coordinate system is still determined by the `aspectRatio` parameter rather than the viewport dimensions. This causes rendering issues where content doesn't match the viewport shape.

## Proposed Changes

### 1. Update `utils.ts` - Add new viewport config type and setup logic

#### Add new config type for viewport setup:
- Create `ViewportSetupConfig` type that requires `viewport`, and either `coordinateWidth` or `coordinateHeight`
- Add `isViewportSetup` function to check for viewport configuration

#### Modify `setupCanvas` function:
- Add new branch for viewport setup that:
  - Calculates `aspectRatio` from viewport dimensions (width/height)
  - Computes pixel dimensions from viewport
  - Calculates missing coordinate dimension based on the provided one and computed aspect ratio
  - Does NOT resize the canvas when viewport is provided
  - Returns the computed aspectRatio so it can be stored in SceneController

### 2. Update `scene.ts` - Store aspectRatio in all cases

#### Modify `SceneController` constructor:
- When no viewport: store aspectRatio from config (current behavior)
- When viewport is provided: store the aspectRatio computed by setupCanvas from viewport dimensions
- This ensures `this.aspectRatio` is always available in SceneController

## Implementation Details

The new viewport behavior will work as follows:

### Without viewport:
- Uses provided `aspectRatio`, `pixelWidth/Height`, and `coordinateWidth/Height`
- Canvas is resized to match pixel dimensions
- AspectRatio from config is stored in SceneController
- Current behavior is preserved

### With viewport:
- Canvas is NOT resized
- `aspectRatio` is computed as `viewport.width / viewport.height`
- Either `coordinateWidth` or `coordinateHeight` must be provided
- The missing coordinate dimension is calculated using the computed aspect ratio
- Scene renders only within the viewport rectangle
- Computed aspectRatio is stored in SceneController

This approach makes viewport rendering more intuitive by automatically matching the coordinate system to the viewport shape, while ensuring aspectRatio is always available in the SceneController.