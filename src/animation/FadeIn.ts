import { Animation } from "./Animation.js";
import * as THREE from "three";

// Configuration types
type FadeInConfig = {
  duration?: number;
  family?: boolean;
  preserveOpacity?: boolean;
  targetOpacity?: {
    fillOpacity?: number;
    strokeOpacity?: number;
  };
}

export default class FadeIn extends Animation {
  public initialOpacity = new Map();
  private preserveOpacity: boolean;
  private targetFillOpacity?: number;
  private targetStrokeOpacity?: number;

  constructor(object: THREE.Object3D, config: FadeInConfig = {}) {
    // Default preserveOpacity to true unless explicitly set to false
    const preserveOpacity = config.preserveOpacity !== false;
    
    // Extract target opacities if provided
    const targetFillOpacity = config.targetOpacity?.fillOpacity;
    const targetStrokeOpacity = config.targetOpacity?.strokeOpacity;
    
    // Default family to true unless explicitly set to false
    const family = config.family !== false;

    super(
      (elapsedTime, _deltaTime) => {
        // Special handling for objects with restyle method (Text or Shape)
        if (typeof (object as any).restyle === 'function') {
          // Get target fill opacity
          const targetFill = targetFillOpacity !== undefined ? targetFillOpacity : 
                             (preserveOpacity ? this.initialOpacity.get(object)?.fillOpacity || 1 : 1);
          
          // For Text objects (no strokeOpacity)
          if (object.constructor.name === 'Text') {
            (object as any).restyle({
              fillOpacity: THREE.MathUtils.lerp(0, targetFill, elapsedTime)
            });
          } 
          // For Shape objects (has strokeOpacity)
          else {
            // Get target stroke opacity
            const targetStroke = targetStrokeOpacity !== undefined ? targetStrokeOpacity : 
                                (preserveOpacity ? this.initialOpacity.get(object)?.strokeOpacity || 1 : 1);
              
            (object as any).restyle({
              fillOpacity: THREE.MathUtils.lerp(0, targetFill, elapsedTime),
              strokeOpacity: THREE.MathUtils.lerp(0, targetStroke, elapsedTime)
            });
          }
        }
        // Standard THREE.js object handling (original code with preserveOpacity logic updated)
        else if (family) {
          this.object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              const targetOpacity = targetFillOpacity !== undefined ? targetFillOpacity : 
                                   (preserveOpacity ? this.initialOpacity.get(child) : 1);
              
              child.material.opacity = THREE.MathUtils.lerp(
                0,
                targetOpacity,
                elapsedTime,
              );
            }
          });
        } else {
          [this.object.stroke, this.object.fill].forEach((mesh) => {
            if (!mesh) return;
            
            const targetOpacity = targetFillOpacity !== undefined ? targetFillOpacity : 
                                 (preserveOpacity ? this.initialOpacity.get(mesh) : 1);
            
            mesh.material.opacity = THREE.MathUtils.lerp(
              0,
              targetOpacity,
              elapsedTime,
            );
          });
        }
      },
      { object, reveal: true, ...config },
    );

    this.preserveOpacity = preserveOpacity;
    this.targetFillOpacity = targetFillOpacity;
    this.targetStrokeOpacity = targetStrokeOpacity;
  }

  setUp() {
    super.setUp();
    
    // Handle objects with restyle method
    if (typeof (this.object as any).restyle === 'function') {
      const opacities: { fillOpacity?: number, strokeOpacity?: number } = {};
      
      // Extract current opacities
      this.object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (!opacities.fillOpacity && child.material.opacity !== undefined) {
            opacities.fillOpacity = child.material.opacity;
          }
        }
      });
      
      // For shapes, try to find stroke opacity
      if (this.object.constructor.name !== 'Text') {
        // Placeholder - customize based on your implementation
        if ((this.object as any).strokeOpacity !== undefined) {
          opacities.strokeOpacity = (this.object as any).strokeOpacity;
        } else if ((this.object as any).style && (this.object as any).style.strokeOpacity !== undefined) {
          opacities.strokeOpacity = (this.object as any).style.strokeOpacity;
        }
      }
      
      // Store opacities and initialize
      this.initialOpacity.set(this.object, opacities);
      
      // Set initial opacity to 0
      if (this.object.constructor.name === 'Text') {
        (this.object as any).restyle({ fillOpacity: 0 });
      } else {
        (this.object as any).restyle({
          fillOpacity: 0,
          strokeOpacity: 0
        });
      }
    } 
    // Original code for standard THREE.js objects
    else {
      this.object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          this.initialOpacity.set(child, child.material.opacity);
        }
      });
    }
  }
}

/*

Example 1: Basic usage - preserving original opacity
new Animation.FadeIn(triangle)


Example2: Fade in everything to 100% opacity, ignoring original opacity
new Animation.FadeIn(triangle, { preserveOpacity: false })


Example 3: Set specific target opacities
new Animation.FadeIn(triangle, {
    targetOpacity: {
      fillOpacity: 0.5,
      strokeOpacity: 0.8
    }
  })

*/