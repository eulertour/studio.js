import { Animation } from "./Animation.js";
import * as THREE from "three";
import { Text } from "../text.js"; // Import your Text class

// Configuration types
type StaggerConfig = {
  duration?: number;
  preserveOpacity?: boolean;
  targetOpacity?: {
    fillOpacity?: number;
    strokeOpacity?: number;
  };
}

export default class Stagger extends Animation {
  private objects: THREE.Object3D[];
  private duration: number;
  private staggerDelay: number;
  private preserveOpacity: boolean;
  private targetFillOpacity?: number;
  private targetStrokeOpacity?: number;
  private initialOpacities: Map<THREE.Object3D, { fillOpacity?: number, strokeOpacity?: number }> = new Map();

  /**
   * Creates a staggered fade-in animation for multiple objects
   * @param objects Array of objects to animate in sequence
   * @param config Additional configuration options
   */
  constructor(objects: THREE.Object3D[], config: StaggerConfig = {}) {
    const { 
      duration = 2 / (objects.length + 1),
      preserveOpacity = true,
      targetOpacity = {} 
    } = config;
    
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
            this.animateObject(object, objectProgress);
          }
        });
      },
      { objects, reveal: true, ...config },
    );

    this.objects = objects;
    this.duration = duration;
    this.staggerDelay = staggerDelay;
    this.preserveOpacity = preserveOpacity;
    this.targetFillOpacity = targetOpacity.fillOpacity;
    this.targetStrokeOpacity = targetOpacity.strokeOpacity;
  }

  /**
   * Determine if an object supports stroke opacity
   */
  private hasStrokeOpacity(object: any): boolean {
    // Text objects don't have strokeOpacity
    return object.constructor.name !== 'Text' && typeof object.restyle === 'function';
  }

  /**
   * Store the initial opacity of an object
   */
  private storeInitialOpacity(object: any) {
    const opacities: { fillOpacity?: number, strokeOpacity?: number } = {};
    
    // For objects with restyle method
    if (typeof object.restyle === 'function') {
      // We need to extract current opacities from the object
      // This depends on your implementation
      object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (!opacities.fillOpacity && child.material.opacity !== undefined) {
            opacities.fillOpacity = child.material.opacity;
          }
        }
      });
      
      // For shapes, try to find stroke opacity
      if (this.hasStrokeOpacity(object)) {
        // You might need to adapt this to get the actual stroke opacity
        // This is a placeholder and depends on your implementation
        if (object.strokeOpacity !== undefined) {
          opacities.strokeOpacity = object.strokeOpacity;
        } else if (object.style && object.style.strokeOpacity !== undefined) {
          opacities.strokeOpacity = object.style.strokeOpacity;
        }
      }
    }
    
    // Store the initial opacities
    this.initialOpacities.set(object, opacities);
  }

  /**
   * Get target opacity for an object
   */
  private getTargetOpacity(object: any, type: 'fillOpacity' | 'strokeOpacity'): number {
    // If specific target is set in config, use that
    if (type === 'fillOpacity' && this.targetFillOpacity !== undefined) {
      return this.targetFillOpacity;
    }
    if (type === 'strokeOpacity' && this.targetStrokeOpacity !== undefined) {
      return this.targetStrokeOpacity;
    }
    
    // If preserving original opacity, use the stored value or default to 1
    if (this.preserveOpacity) {
      const initialOpacities = this.initialOpacities.get(object) || {};
      return initialOpacities[type] !== undefined ? initialOpacities[type]! : 1;
    }
    
    // Default to 1
    return 1;
  }

  /**
   * Animate a single object based on progress
   */
  private animateObject(object: any, progress: number) {
    // Handle Text objects (they only have fillOpacity)
    if (object instanceof Text) {
      const targetFillOpacity = this.getTargetOpacity(object, 'fillOpacity');
      object.restyle({
        fillOpacity: progress * targetFillOpacity
      });
    } 
    // Handle Shape objects (or any objects with both fillOpacity and strokeOpacity)
    else if (typeof object.restyle === 'function') {
      if (this.hasStrokeOpacity(object)) {
        const targetFillOpacity = this.getTargetOpacity(object, 'fillOpacity');
        const targetStrokeOpacity = this.getTargetOpacity(object, 'strokeOpacity');
        
        object.restyle({
          fillOpacity: progress * targetFillOpacity,
          strokeOpacity: progress * targetStrokeOpacity
        });
      } else {
        // Fall back to just fillOpacity if no stroke opacity
        const targetFillOpacity = this.getTargetOpacity(object, 'fillOpacity');
        object.restyle({
          fillOpacity: progress * targetFillOpacity
        });
      }
    } 
    // Default case for standard THREE.js objects
    else {
      const targetOpacity = this.getTargetOpacity(object, 'fillOpacity');
      object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.opacity !== undefined) {
                mat.opacity = progress * targetOpacity;
              }
            });
          } else if (child.material.opacity !== undefined) {
            child.material.opacity = progress * targetOpacity;
          }
        }
      });
    }
  }

  setUp() {
    super.setUp();
    
    // Store initial opacities if we need to preserve them
    if (this.preserveOpacity) {
      this.objects.forEach(object => {
        this.storeInitialOpacity(object);
      });
    }
    
    // Make sure all objects start with opacity 0
    this.objects.forEach(object => {
      if (object instanceof Text) {
        object.restyle({
          fillOpacity: 0
        });
      } else if (typeof object.restyle === 'function') {
        if (this.hasStrokeOpacity(object)) {
          object.restyle({
            fillOpacity: 0,
            strokeOpacity: 0
          });
        } else {
          object.restyle({
            fillOpacity: 0
          });
        }
      } else {
        // Standard THREE.js objects
        object.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
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
      }
    });
  }
}
/*
// Example 1: Basic usage - fade to full opacity
new Stagger(
  [
    formula.greenTriangleArea,
    formula.areaOfHexagon,
    formula.areaOfHexagonAnswer,
  ],
  { duration: 0.2 }
);

// Example 2: Preserve original opacities
new Stagger(
  [
    formula.greenTriangleArea,
    formula.areaOfHexagon,
    formula.areaOfHexagonAnswer,
  ],
  { 
    duration: 0.2,
    preserveOpacity: true
  }
);

// Example 3: Set specific target opacities
new Stagger(
  [
    formula.greenTriangleArea,
    formula.areaOfHexagon,
    formula.areaOfHexagonAnswer,
  ],
  { 
    duration: 0.2,
    preserveOpacity: false,
    targetOpacity: {
      fillOpacity: 0.8,
      strokeOpacity: 1.0
    }
  }
);




*/