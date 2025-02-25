import { describe, test, expect } from "bun:test";
import * as THREE from 'three';
import Shape from '../src/geometry/Shape.js';
import { Vector3, Color } from 'three';
import { MeshBasicMaterial } from 'three';

// Test implementation with explicit type handling
class TestShape extends Shape {
  constructor(points = [new THREE.Vector3(0, 0, 0)]) {
    super(points, {
      fillColor: new THREE.Color('white'),
      strokeColor: new THREE.Color('black'),
      strokeWidth: 2,
      arrow: false,
      fill: true,
      stroke: true
    });
  }
  
  getAttributes() { return {}; }
  getCurveEndIndices() { return []; }
}

describe("Shape", () => {
  describe("restyle", () => {
    test("updates material properties", () => {
      const shape = new TestShape();
      if (!shape.fill || !shape.stroke) {
        throw new Error("Shape missing required properties");
      }

      const newFill = new THREE.Color('#ff0000');
      shape.restyle({ 
        fillColor: newFill,
        fillOpacity: 0.5,
        strokeWidth: 4
      });

      const fillMat = shape.fill.material;
      expect(fillMat.color.getHexString()).toBe('ff0000');
      expect(fillMat.opacity).toBe(0.5);

      const strokeMat = shape.stroke.material;
      expect(strokeMat.width).toBe(4);
    });

    test("propagates to direct children", () => {
      const parent = new TestShape();
      const child = new TestShape();
      
      if (!parent.fill || !child.fill) {
        throw new Error("Shapes missing required properties");
      }

      parent.add(child);
      
      const newColor = new THREE.Color('blue');
      parent.restyle({ fillColor: newColor }, { includeChildren: true });
      
      expect(parent.fill.material.color.getHexString()).toBe('0000ff');
      expect(child.fill.material.color.getHexString()).toBe('0000ff');
    });

    test("ignores non-Shape children", () => {
      const parent = new TestShape();
      const light = new THREE.PointLight();
      parent.add(light);
      
      parent.restyle({ fillColor: new THREE.Color('green') }, { includeChildren: true });
      
      expect(light.userData.fill).toBeUndefined();
    });
  });
}); 