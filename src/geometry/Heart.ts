import Shape, { Style } from "./Shape.js";
import { THREE } from "../index.js";
import { ERROR_THRESHOLD } from "../constants.js";

export type HeartAttributes = {
  size: number;
};

/**
 * A heart shape created using parametric equations.
 */
export default class Heart extends Shape {
  public size: number;

  constructor(size: number = 1, config: Style = {}) {
    // Generate points using the parametric equations
    const points: THREE.Vector3[] = [];
    
    // Generate heart curve using parametric equations
    for (let t = 0; t <= 2 * Math.PI + ERROR_THRESHOLD; t += 0.1) {
      // Heart parametric equations
      const x = size * Math.sqrt(2) * Math.pow(Math.sin(t), 3);
      const y = size * (
        -Math.pow(Math.cos(t), 3) - 
        Math.pow(Math.cos(t), 2) + 
        2 * Math.cos(t)
      );
      
      points.push(new THREE.Vector3(x, y, 0));
    }
    
    super(points, {
      ...Heart.defaultConfig(),
      ...config,
    });
    
    this.size = size;
  }
  
  getCloneAttributes() {
    return [this.size];
  }
  
  getAttributes(): HeartAttributes {
    return {
      size: this.size
    };
  }
  
  static fromAttributes(attributes: HeartAttributes): Heart {
    const { size } = attributes;
    return new Heart(size);
  }
  
  get attributeData() {
    return [
      {
        attribute: "size",
        type: "number",
        default: 1,
      },
    ];
  }
  
  area() {
    // Approximation of heart area - you could implement a more accurate calculation
    return Math.PI * this.size * this.size;
  }
}
