# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

studio.js is a TypeScript library built on top of Three.js (WebGPU version) that provides a declarative API for creating mathematical animations and visualizations. It powers Euler Studio and extends Three.js with utilities for scene management, animations, and geometric shapes.

## Key Commands

### Development
```bash
bun run dev              # Start Vite dev server for local development
```

### Testing
```bash
bun run test            # Run all tests with Vitest
bun run test -- <pattern>  # Run specific test files matching pattern
```

### Building
```bash
bun run build           # Full build process (TypeScript → Rollup → docs → examples)
```

### Deployment
```bash
bun run deploy:development   # Deploy to development environment
bun run deploy:staging      # Deploy to staging environment  
bun run deploy:production   # Deploy to production environment
```

## Architecture Overview

### Core Extension Pattern
The library extends Three.js Object3D with utility methods in `src/index.ts`. These extensions are applied to the Object3D prototype to provide methods like:
- `shift()`, `moveTo()` - positioning utilities
- `show()`, `hide()` - visibility control  
- `showComponent()`, `hideComponent()` - component-based visibility
- `setAlpha()` - opacity control

### Scene Management System
- **StudioScene Interface** (`src/scene.ts`): All scenes must implement this interface with `update(elapsedTime, deltaTime)` method
- **SceneController**: Manages scene lifecycle, handles animation timing, and provides playback controls
- Scenes define shapes in constructor and animations via the animation system

### Animation Architecture
Animations (`src/animation/`) follow a consistent pattern:
1. Abstract `Animation` base class defines the interface
2. Concrete animations (Shift, Rotate, FadeIn, etc.) implement specific behaviors
3. Animations can be:
   - Sequenced using `Sequence` class
   - Run in parallel using `Together` class
   - Delayed using `Wait` class

### Geometry System
- Abstract `Shape` class (`src/geometry/Shape.ts`) defines common properties (fill, stroke, etc.)
- Concrete shapes extend Shape and create Three.js geometries
- WebGPU integration through custom `WebGPUMeshLine` for advanced line rendering

### Component System
Objects can have named "components" that can be independently shown/hidden. This enables:
- Revealing parts of complex objects progressively
- Managing visibility of sub-elements without creating separate objects

## Development Patterns

### Creating New Animations
1. Extend the `Animation` class
2. Implement `animate(object, elapsedTime, deltaTime)` method
3. Return `true` when animation is complete
4. Place in `src/animation/` directory

### Creating New Shapes
1. Extend the `Shape` class
2. Implement geometry creation in constructor
3. Apply fill/stroke materials based on configuration
4. Place in `src/geometry/` directory

### WebGPU Considerations
The codebase uses Three.js WebGPU renderer. When working with rendering:
- Check WebGPU-specific APIs in Three.js documentation
- The custom WebGPUMeshLine implementation in `src/geometry/WebGPUMeshLine/` handles line rendering
- Test on WebGPU-enabled browsers

## Testing Strategy
- Unit tests use Vitest and are located in `/test/`
- Focus on geometry creation and mathematical correctness
- Mock Three.js objects when needed for isolated testing
- Run specific tests with: `bun run test -- <filename>`

## Build Process
The build process (`bun run build`) executes multiple steps:
1. TypeScript compilation with declaration files
2. Rollup bundling for library distribution
3. MathJax font bundling for text rendering
4. Three.js type definitions bundling
5. API documentation generation via API Extractor
6. Example file copying to build directory

## Firebase Deployment
Deployment uses Firebase Admin SDK with environment-specific configurations:
- Development, staging, and production environments
- Deployment scripts in `/deploy/` directory
- Requires appropriate Firebase credentials