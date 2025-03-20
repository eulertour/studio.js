import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class Stagger extends Animation {
    private objects: THREE.Object3D[];
    private initialOpacities: Map<THREE.Object3D, number> = new Map();
    private duration: number;
    private staggerDelay: number;

    /**
     * Creates a staggered fade-in animation for multiple objects
     * @param objects Array of objects to animate in sequence
     * @param duration Total duration for each individual fade in animation
     * @param staggerDelay Delay between starting each object's animation (in seconds)
     * @param config Additional configuration options
     */
    constructor(
        objects: THREE.Object3D[],
        duration: number = 0.5,
        staggerDelay: number = 0.2,
        config: any = {}
    ) {
        super(
            (elapsedTime, _deltaTime) => {
                // For each object, calculate its individual progress
                objects.forEach((object, index) => {
                    // When this specific object should start animating
                    const startTime = index * staggerDelay;
                    // Individual progress for this specific object
                    const objectProgress = Math.max(0, Math.min(1, (elapsedTime - startTime) / duration));
                    
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
                                    objectProgress
                                );
                            }
                        });
                    }
                });
            },
            { objects, reveal: true, ...config }
        );

        this.objects = objects;
        this.duration = duration;
        this.staggerDelay = staggerDelay;
    }

    setUp() {
        super.setUp();
        // Store initial opacity values for all objects
        this.objects.forEach(object => {
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
