import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class StaggerEmphasize extends Animation {
    private objectGroups: THREE.Object3D[][] = [];
    private initialScales: Map<THREE.Object3D, number> = new Map();
    private largeScale: number;
    private stayEmphasized: boolean;
    private keyframe = 0.9;
    
    /**
     * Creates a staggered sequence of emphasis animations.
     * Objects inside arrays will be emphasized simultaneously.
     * 
     * @param args Objects or groups of objects (in arrays) to emphasize in sequence
     * @param config Configuration options including largeScale and stayEmphasized
     * @example
     * // Emphasize obj1, then obj2 and obj3 together, then obj4
     * new StaggerEmphasize(obj1, [obj2, obj3], obj4, { largeScale: 1.2, stayEmphasized: true })
     */
    constructor(
        ...args: Array<THREE.Object3D | THREE.Object3D[] | { largeScale?: number, stayEmphasized?: boolean }>
    ) {
        // Must call super first before accessing 'this'
        super((elapsedTime) => {
            const totalGroups = this.objectGroups.length;
            if (totalGroups === 0) return;
            
            const totalDuration = 1.0; // Total animation takes 1 second
            const groupDuration = totalDuration / totalGroups;
            
            // First, reset all objects to initial scale if they're not yet active
            this.objectGroups.forEach((group, groupIndex) => {
                const startTime = groupIndex * groupDuration;
                if (elapsedTime < startTime) {
                    // Not yet active, ensure initial scale
                    group.forEach(obj => {
                        const initialScale = this.initialScales.get(obj) || 1;
                        obj.scale.setScalar(initialScale);
                    });
                }
            });
            
            // Then animate active groups
            this.objectGroups.forEach((group, groupIndex) => {
                const startTime = groupIndex * groupDuration;
                const endTime = startTime + groupDuration;
                
                // Skip if we haven't reached this group yet
                if (elapsedTime < startTime) return;
                
                // For each object in this group
                group.forEach(obj => {
                    const initialScale = this.initialScales.get(obj) || 1;
                    let scale;
                    
                    // Calculate normalized local time for this group
                    const localTime = (elapsedTime - startTime) / groupDuration;
                    
                    if (this.stayEmphasized) {
                        // If we're past the end time for this group and need to stay emphasized
                        if (elapsedTime > endTime) {
                            // Stay at keyframe (peak emphasis)
                            scale = initialScale * this.largeScale;
                        } 
                        // Otherwise animate normally up to keyframe
                        else if (localTime <= this.keyframe) {
                            // Interpolate from initial to large scale
                            const t = localTime / this.keyframe;
                            scale = initialScale * (1 + (this.largeScale - 1) * t);
                        } else {
                            // At or past keyframe, stay at large scale
                            scale = initialScale * this.largeScale;
                        }
                    } 
                    // Regular animation (not staying emphasized)
                    else {
                        // Only animate if within our time window
                        if (elapsedTime <= endTime) {
                            if (localTime <= this.keyframe) {
                                // Growing phase - to peak
                                const t = localTime / this.keyframe;
                                scale = initialScale * (1 + (this.largeScale - 1) * t);
                            } else {
                                // Shrinking phase - back to normal
                                const t = (localTime - this.keyframe) / (1 - this.keyframe);
                                scale = initialScale * (this.largeScale - (this.largeScale - 1) * t);
                            }
                        } else {
                            // Past our time window, return to initial scale
                            scale = initialScale;
                        }
                    }
                    
                    // Apply the calculated scale
                    obj.scale.setScalar(scale);
                });
            });
        }, { reveal: true });
        
        // Parse arguments
        let config = {};
        let objects = [...args];
        
        // Extract config if the last argument is an object but not a THREE.Object3D
        if (args.length > 0 && !Array.isArray(args[args.length-1]) && 
            !(args[args.length-1] instanceof THREE.Object3D)) {
            config = objects.pop() as any;
        }
        
        const { largeScale = 1.1, stayEmphasized = false } = config as any;
        this.largeScale = largeScale;
        this.stayEmphasized = stayEmphasized;
        
        // Process each argument - organize into groups
        objects.forEach((item) => {
            if (Array.isArray(item)) {
                // This is already a group, filter to only include THREE.Object3D instances
                const validObjects = item.filter(obj => obj instanceof THREE.Object3D) as THREE.Object3D[];
                if (validObjects.length > 0) {
                    this.objectGroups.push(validObjects);
                }
            } else if (item instanceof THREE.Object3D) {
                // Single object becomes its own group
                this.objectGroups.push([item]);
            }
        });
        
        // Debug output
        console.log(`StaggerEmphasize: Created with ${this.objectGroups.length} groups`);
        this.objectGroups.forEach((group, i) => {
            console.log(`Group ${i}: ${group.length} objects`);
        });
    }
    
    setUp() {
        super.setUp();
        
        // Store initial scales of all objects
        this.objectGroups.forEach(group => {
            group.forEach(obj => {
                this.initialScales.set(obj, obj.scale.x);
                console.log(`Initial scale for object: ${obj.scale.x}`);
            });
        });
    }
    
    tearDown() {
        // Restore all objects to their initial scales
        this.objectGroups.forEach(group => {
            group.forEach(obj => {
                const initialScale = this.initialScales.get(obj) || 1;
                obj.scale.setScalar(initialScale);
            });
        });
        
        super.tearDown();
    }
}