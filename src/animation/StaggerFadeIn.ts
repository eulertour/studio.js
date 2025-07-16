import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";

export default class Stagger extends Animation {
  private objects: THREE.Object3D[];
  private initialOpacities: Map<THREE.Object3D, number> = new Map();
  private duration: number;
  private staggerDelay: number;

  /**
   * Creates a staggered fade-in animation for multiple objects
   * @param objects Array of objects to animate in sequence
   * @param config Additional configuration options
   */
  constructor(objects: THREE.Object3D[], config: { duration?: number } = {}) {
    const { duration = 2 / (objects.length + 1) } = config;
    const staggerDelay = (1 - duration) / (objects.length - 1);

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
            object.traverse((child: THREE.Object3D) => {
              if (child instanceof THREE.Mesh && child.material) {
                const initialOpacity = config?.preserveOpacity
                  ? this.initialOpacities.get(child) || 1
                  : 1;
                child.material.opacity = THREE.MathUtils.lerp(
                  0,
                  initialOpacity,
                  objectProgress,
                );
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
    // Store initial opacity values for all objects
    this.objects.forEach((object) => {
      object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          this.initialOpacities.set(child, child.material.opacity);
          // Start with opacity 0
          child.material.opacity = 0;
        }
      });
    });
  }
}
