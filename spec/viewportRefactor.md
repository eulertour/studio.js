# ViewportManager Refactoring Specification

## Overview
Refactor ViewportManager to use Vector2 properties for viewportSize and viewportOffset that are automatically updated when the viewport is set, replacing the current getter methods.

## Current Implementation
- `getViewportSize()`: Creates a new Vector2 from viewport dimensions or returns screenSize
- `getViewportOffset()`: Creates a new Vector2 from viewport position or returns (0,0)
- These methods create new objects on each call

## Proposed Implementation
- Add `viewportSize` and `viewportOffset` as Vector2 properties
- Update these properties automatically when `setViewport()` is called
- Remove `getViewportSize()` and `getViewportOffset()` methods
- WebGPUMeshLine will reference these properties directly instead of calling methods

## Changes Required

### 1. ViewportManager.ts
- Add private properties:
  - `_viewportSize: Vector2`
  - `_viewportOffset: Vector2`
- Initialize these in constructor:
  - `_viewportSize = new Vector2(1, 1)`
  - `_viewportOffset = new Vector2(0, 0)`
- Update `setViewport()` to update these properties:
  - If viewport is defined: set size from viewport.z/w, offset from viewport.x/y
  - If viewport is undefined: set size from screenSize, offset to (0,0)
- Add getters for `viewportSize` and `viewportOffset` to return the Vector2 properties
- Remove `getViewportSize()` and `getViewportOffset()` methods

### 2. WebGPUMeshLine/index.ts
- Update `createUniforms()` function:
  - Line 117: Change `uniform(viewportManager.getViewportSize())` to `uniform(viewportManager.viewportSize)`
  - Line 118: Change `uniform(viewportManager.getViewportOffset())` to `uniform(viewportManager.viewportOffset)`
- Update `update()` method:
  - Line 274: Change `setUniform("viewportSize", viewportManager.getViewportSize())` to `setUniform("viewportSize", viewportManager.viewportSize)`
  - Line 275: Change `setUniform("viewportOffset", viewportManager.getViewportOffset())` to `setUniform("viewportOffset", viewportManager.viewportOffset)`

## Implementation Steps

1. Update ViewportManager.ts:
   - Add the new private Vector2 properties
   - Initialize them in the constructor
   - Update setViewport() to update these properties
   - Add public getters for viewportSize and viewportOffset
   - Remove the old methods

2. Update WebGPUMeshLine/index.ts:
   - Replace method calls with property access in createUniforms()
   - Replace method calls with property access in update()

3. Search for any other usages of getViewportSize() or getViewportOffset() and update them

## Testing Considerations
- Verify that viewport updates propagate correctly to the Vector2 properties
- Ensure WebGPUMeshLine uniforms receive the correct values
- Test with both defined and undefined viewport scenarios
- Confirm no breaking changes in rendering behavior