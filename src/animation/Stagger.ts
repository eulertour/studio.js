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

// Define types for our animation items
type AnimationItem = THREE.Object3D | THREE.Object3D[];

export default class Stagger extends Animation {
  private items: AnimationItem[];
  private duration: number;
  private staggerDelay: number;
  private preserveOpacity: boolean;
  private targetFillOpacity?: number;
  private targetStrokeOpacity?: number;
  private initialOpacities: Map<THREE.Object3D, { fillOpacity?: number, strokeOpacity?: number }> = new Map();

  /**
   * Creates a staggered fade-in animation for multiple objects
   * @param args Variable arguments containing objects to animate and a config object
   *        Pass objects in sequence to fade them in one after another
   *        Wrap objects in an array to make them fade in simultaneously
   *        The last argument should be a config object
   * 
   * Examples:
   * new Stagger(obj1, obj2, obj3, { duration: 0.2 })
   * new Stagger(obj1, [obj2, obj3], obj4, { duration: 0.2 })
   */
  constructor(...args: any[]) {
    // Extract config from last argument if it's an object and not a THREE.Object3D
    let config: StaggerConfig = {};
    let animationItems: AnimationItem[] = [];
    
    if (args.length > 0) {
      const lastArg = args[args.length - 1];
      if (lastArg && typeof lastArg === 'object' && !(lastArg instanceof THREE.Object3D) && !Array.isArray(lastArg)) {
        config = lastArg;
        // Remove config from args
        animationItems = args.slice(0, -1) as AnimationItem[];
      } else {
        // All args are animation items
        animationItems = args as AnimationItem[];
      }
    }
    
    // Count total animation steps (a nested array counts as one step)
    const totalSteps = animationItems.length;
    
    const { 
      duration = 2 / (totalSteps + 1),
      preserveOpacity = true,
      targetOpacity = {} 
    } = config;
    
    // Calculate delay between steps
    const staggerDelay = totalSteps > 1 ? (1 - duration) / (totalSteps - 1) : 0;

    // Extract all objects for the super constructor
    const allObjects = Stagger.flattenItems(animationItems);
    
    // Call super constructor first, before accessing 'this'
    super(
      (elapsedTime, _deltaTime) => {
        animationItems.forEach((item, index) => {
          const startTime = index * staggerDelay;
          const stepProgress = THREE.MathUtils.clamp(
            (elapsedTime - startTime) / duration,
            0,
            1,
          );

          // Only process if animation has started for this step
          if (stepProgress > 0) {
            // If the item is an array, animate all objects in the group simultaneously
            if (Array.isArray(item)) {
              item.forEach(obj => this.animateObject(obj, stepProgress));
            } else {
              // Otherwise, animate the single object
              this.animateObject(item, stepProgress);
            }
          }
        });
      },
      { objects: allObjects, reveal: true, ...config },
    );

    // Now it's safe to use 'this'
    this.items = animationItems;
    this.duration = duration;
    this.staggerDelay = staggerDelay;
    this.preserveOpacity = preserveOpacity;
    this.targetFillOpacity = targetOpacity.fillOpacity;
    this.targetStrokeOpacity = targetOpacity.strokeOpacity;
  }

  /**
   * Flattens the nested array structure to get all objects for initialization
   * Static method so it can be called before initializing 'this'
   */
  private static flattenItems(items: AnimationItem[]): THREE.Object3D[] {
    const flattenedObjects: THREE.Object3D[] = [];
    
    items.forEach(item => {
      if (Array.isArray(item)) {
        flattenedObjects.push(...item);
      } else {
        flattenedObjects.push(item);
      }
    });
    
    return flattenedObjects;
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
                mat.transparent = true; // Ensure transparency is enabled
              }
            });
          } else if (child.material.opacity !== undefined) {
            child.material.opacity = progress * targetOpacity;
            child.material.transparent = true; // Ensure transparency is enabled
          }
        }
      });
    }
  }

  setUp() {
    super.setUp();
    
    // Get all objects to initialize
    const allObjects = Stagger.flattenItems(this.items);
    
    // Store initial opacities if we need to preserve them
    if (this.preserveOpacity) {
      allObjects.forEach(object => {
        this.storeInitialOpacity(object);
      });
    }
    
    // Make sure all objects start with opacity 0
    allObjects.forEach(object => {
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
                  mat.transparent = true; // Ensure transparency is enabled
                }
              });
            } else if (child.material.opacity !== undefined) {
              child.material.opacity = 0;
              child.material.transparent = true; // Ensure transparency is enabled
            }
          }
        });
      }
    });
  }
}

/*
// Example 1: All items fade in sequentially
new Stagger(
  triangle,
  text1,
  text2,
  { duration: 0.2 }
);

// Example 2: Triangle fades in first, then text1 and text2 fade in together, then text3
new Stagger(
  triangle,
  [text1, text2],
  text3,
  { duration: 0.2 }
);

// Example 3: Custom target opacities
new Stagger(
  item1,
  [item2, item3],
  item4,
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