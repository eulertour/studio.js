import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class FadeIn extends Animation {
  public initialOpacity = new Map();

  constructor(object: THREE.Object3D, config?: any) {
    let family = true;
    if (config && config.family === false) {
      family = false;
    }

    super(
      (elapsedTime, _deltaTime) => {
        // Special handling for objects with restyle method (Text or Shape)
        if (typeof (object as any).restyle === 'function') {
          const targetFillOpacity = config?.preserveOpacity 
            ? this.initialOpacity.get(object)?.fillOpacity || 1
            : 1;
            
          // For Text objects (no strokeOpacity)
          if (object.constructor.name === 'Text') {
            (object as any).restyle({
              fillOpacity: THREE.MathUtils.lerp(0, targetFillOpacity, elapsedTime)
            });
          } 
          // For Shape objects (has strokeOpacity)
          else {
            const targetStrokeOpacity = config?.preserveOpacity
              ? this.initialOpacity.get(object)?.strokeOpacity || 1
              : 1;
              
            (object as any).restyle({
              fillOpacity: THREE.MathUtils.lerp(0, targetFillOpacity, elapsedTime),
              strokeOpacity: THREE.MathUtils.lerp(0, targetStrokeOpacity, elapsedTime)
            });
          }
        }
        // Standard THREE.js object handling (original code)
        else if (family) {
          this.object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              child.material.opacity = THREE.MathUtils.lerp(
                0,
                config?.preserveOpacity ? this.initialOpacity.get(child) : 1,
                elapsedTime,
              );
            }
          });
        } else {
          [this.object.stroke, this.object.fill].forEach((mesh) => {
            if (!mesh) return;
            mesh.material.opacity = THREE.MathUtils.lerp(
              0,
              config?.preserveOpacity ? this.initialOpacity.get(mesh) : 1,
              elapsedTime,
            );
          });
        }
      },
      { object, reveal: true, ...config },
    );
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