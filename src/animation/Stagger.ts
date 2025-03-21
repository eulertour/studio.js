import { Animation } from "./Animation.js";
import * as THREE from "three";
import { Text } from "../text.js"; // Import your Text class
// Import your Shape class if available, or use type checking

export default class Stagger extends Animation {
  private objects: THREE.Object3D[];
  private duration: number;
  private staggerDelay: number;

  /**
   * Creates a staggered fade-in animation for multiple objects
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
            // Handle Text objects specifically (they only have fillOpacity)
            if (object instanceof Text) {
              object.restyle({
                fillOpacity: objectProgress
              });
            } 
            // Handle Shape objects (or any objects with both fill and stroke opacity)
            else if (typeof (object as any).restyle === 'function') {
              // Check if the object has a strokeOpacity property or method
              if (hasStrokeOpacity(object)) {
                (object as any).restyle({
                  fillOpacity: objectProgress,
                  strokeOpacity: objectProgress
                });
              } else {
                // Fall back to just fillOpacity if no stroke opacity
                (object as any).restyle({
                  fillOpacity: objectProgress
                });
              }
            } 
            // Default case for standard THREE.js objects
            else {
              object.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh && child.material) {
                  if (Array.isArray(child.material)) {
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
      // Handle Text objects specifically
      if (object instanceof Text) {
        object.restyle({
          fillOpacity: 0
        });
      } 
      // Handle Shape objects (or any objects with both fill and stroke opacity)
      else if (typeof (object as any).restyle === 'function') {
        if (hasStrokeOpacity(object)) {
          (object as any).restyle({
            fillOpacity: 0,
            strokeOpacity: 0
          });
        } else {
          (object as any).restyle({
            fillOpacity: 0
          });
        }
      } 
      // Default case for standard THREE.js objects
      else {
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

// Helper function to determine if an object supports strokeOpacity
function hasStrokeOpacity(object: any): boolean {
  // You can customize this function based on your specific implementation
  // Option 1: Check if the object is a specific Shape class
  // return object instanceof Shape;
  
  // Option 2: Check for a property that would indicate it supports stroke opacity
  // return object.strokeColor !== undefined || object.strokeWidth !== undefined;
  
  // Option 3: Check the object's constructor name
  return object.constructor.name !== 'Text' && typeof object.restyle === 'function';
}