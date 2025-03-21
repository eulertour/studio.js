import { Animation } from "./Animation.js";
import * as THREE from "three";
import { Text } from "./Text.js"; // Import your Text class

export default class TextStagger extends Animation {
  private objects: THREE.Object3D[];
  private duration: number;
  private staggerDelay: number;

  /**
   * Creates a staggered fade-in animation specifically for Text objects
   * @param objects Array of objects to animate in sequence
   * @param config Additional configuration options
   */
  constructor(objects: THREE.Object3D[], config: { duration?: number } = {}) {
    const { duration = 2 / (objects.length + 1) } = config;
    const staggerDelay = objects.length > 1 ? (1 - duration) / (objects.length - 1) : 0;

    super(
      (elapsedTime, _deltaTime) => {
        objects.forEach((object, index) => {
          const startTime = index * staggerDelay;
          const objectProgress = THREE.MathUtils.clamp(
            (elapsedTime - startTime) / duration,
            0,
            1,
          );

          // Only process if animation has started for this object
          if (objectProgress > 0) {
            // Update opacity for all mesh materials in the object
            object.traverse((child: THREE.Object3D) => {
              if (child instanceof THREE.Mesh && child.material) {
                if (Array.isArray(child.material)) {
                  // Handle arrays of materials
                  child.material.forEach(mat => {
                    if (mat.opacity !== undefined) {
                      mat.opacity = objectProgress;
                    }
                  });
                } else if (child.material.opacity !== undefined) {
                  child.material.opacity = objectProgress;
                }
              }
            });
          }
        });
      },
      { objects, reveal: true, ...config },
    );

    this.objects = objects;
    this.duration = duration;
    this.staggerDelay = staggerDelay;
  }

  setUp() {
    super.setUp();
    
    // Make sure all objects start with opacity 0
    this.objects.forEach((object) => {
      object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            // Handle arrays of materials
            child.material.forEach(mat => {
              if (mat.opacity !== undefined) {
                mat.opacity = 0;
              }
            });
          } else if (child.material.opacity !== undefined) {
            child.material.opacity = 0;
          }
        }
      });
    });
  }
}

// Add a helper method to your Text class
// You can add this to your Text.ts file:

/*
// Add this method to your Text class
setOpacity(opacity: number): void {
  this.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => {
          mat.opacity = opacity;
        });
      } else {
        child.material.opacity = opacity;
      }
    }
  });
}
*/

// Usage in your animations:
/*
this.animations = [
  // Other animations...
  
  new TextStagger([
    formula.greenTriangleArea,
    formula.areaOfHexagon,
    formula.areaOfHexagonAnswer,
  ], { duration: 0.2 }),
  
  // Other animations...
];
*/