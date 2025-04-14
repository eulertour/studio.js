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

  constructor(size: number, config: Style = {}) {
    size = size /15;
    // Generate points using the parametric equations
    const points: THREE.Vector3[] = [];
    
    // Y-offset to move the heart up by 0.2 units
    const yOffset = 0.2;
    
    // Generate heart curve using parametric equations
    for (let t = 0; t <= 2 * Math.PI + ERROR_THRESHOLD; t += 0.1) { 
      // Alternative heart equation:
    //   const x = size * Math.sqrt(2) * Math.pow(Math.sin(t), 3);
    //   const y = size * (
    //       2 * Math.cos(t)
    //       - Math.pow(Math.cos(t), 2)
    //     - Math.pow(Math.cos(t), 3)
    //   );
    const x = size * (16 * Math.pow(Math.sin(t), 3));
    const y = size * (
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t)
    ) + yOffset;
      
      points.push(new THREE.Vector3(x, y, 0));
    }
    
    super(points, {
      ...Heart.defaultConfig(),
      ...config,
    });
    
    this.size = size;
    this.points[1] = new THREE.Vector3(size * (16 * Math.pow(Math.sin(Math.PI), 3)), size * (13 * Math.cos(Math.PI) - 5 * Math.cos(2 * Math.PI) - 2 * Math.cos(3 * Math.PI) - Math.cos(4 * Math.PI)) + yOffset, 0);
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

  centerVertically(offset: number = 0.2) {
    // Calculate the current bounds of the heart
    const boundingBox = new THREE.Box3().setFromObject(this);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    // Apply the offset to all points
    if (this.stroke && this.stroke.geometry) {
      const newPoints = this.points.map(point => {
        const newPoint = point.clone();
        newPoint.y -= center.y; // Center at origin first
        newPoint.y += offset;   // Then add the desired offset
        return newPoint;
      });
      
      this.stroke.geometry.setPoints(newPoints);
      
      // Update fill geometry if it exists
      if (this.fill) {
        this.fill.geometry.dispose();
        const shape = new THREE.Shape();
        
        if (newPoints.length > 0 && newPoints[0]) {
          shape.moveTo(newPoints[0].x, newPoints[0].y);
          
          for (const point of newPoints.slice(1)) {
            if (point) {
              shape.lineTo(point.x, point.y);
            }
          }
          
          shape.closePath();
          this.fill.geometry = new THREE.ShapeGeometry(shape);
        }
      }
    }
    
    return this;
  }
}
