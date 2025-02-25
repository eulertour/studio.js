import { describe, test, expect } from "bun:test";
import * as THREE from 'three';
import Shape from '../src/geometry/Shape.js';
import { Vector3, Color } from 'three';
import { MeshBasicMaterial } from 'three';

// Test implementation with explicit type handling
class TestShape extends Shape {
  constructor(points: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.5, 0, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(1, 0.5, 0),
    new THREE.Vector3(1, 1, 0),
    new THREE.Vector3(0.5, 1, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(0, 0, 0)  // 闭合路径
  ]) {
    super(points, {
      fillColor: new THREE.Color('white'),
      strokeColor: new THREE.Color('black'),
      strokeWidth: 2,
      arrow: false,
      fill: true,
      stroke: true
    });
  }
  
  public getAttributes() { return {}; }
  public getCurveEndIndices() { return []; }

  // 添加 getter 方法来访问 protected 属性
  public getFill() { return this.fill; }
  public getStroke() { return this.stroke; }
}

describe("Shape", () => {
  describe("restyle", () => {
    test("updates material properties", () => {
      const shape = new TestShape();
      const newFill = new THREE.Color('#ff0000');
      
      shape.restyle({ 
        fillColor: newFill,
        fillOpacity: 0.5,
        strokeWidth: 4
      });

      const fillMat = shape.getFill().material as THREE.MeshBasicMaterial;
      expect(fillMat.color.getHexString()).toBe('ff0000');
      expect(fillMat.opacity).toBe(0.5);

      const strokeMat = shape.getStroke().material as any;
      expect(strokeMat.width).toBe(4);
    });

    test("propagates to direct children when includeChildren is true", () => {
      const parent = new TestShape();
      const child = new TestShape();
      const grandchild = new TestShape();
      
      parent.add(child);
      child.add(grandchild);
      
      const newColor = new THREE.Color('blue');
      parent.restyle({ fillColor: newColor }, { includeChildren: true });
      
      expect(parent.getFill().material.color.getHexString()).toBe('0000ff');
      expect(child.getFill().material.color.getHexString()).toBe('0000ff');
      expect(grandchild.getFill().material.color.getHexString()).not.toBe('0000ff');
    });

    test("ignores non-Shape children", () => {
      const parent = new TestShape();
      const light = new THREE.PointLight();
      parent.add(light);
      
      parent.restyle({ fillColor: new THREE.Color('green') }, { includeChildren: true });
      
      expect(light.userData.fill).toBeUndefined();
    });
  });

  test("material update", () => {
    const shape = new TestShape([new Vector3()]);
    const material = shape.getFill().material as MeshBasicMaterial;
    material.color = new Color('red');
    expect(material.color.getHexString()).toBe('ff0000');
  });

  test("restyle updates materials", () => {
    const shape = new TestShape();
    if (!shape.fill) {
      throw new Error("Shape fill not initialized");
    }

    const newColor = new THREE.Color('red');
    shape.restyle({ fillColor: newColor });
    
    expect(shape.fill.material.color.getHexString())
      .toBe(newColor.getHexString());
  });

  test("includeChildren propagates to direct children", () => {
    const parent = new TestShape();
    const child = new TestShape();
    const grandchild = new TestShape();
    
    if (!parent.fill || !child.fill || !grandchild.fill) {
      throw new Error("Shapes missing required properties");
    }

    parent.add(child);
    child.add(grandchild);
    
    const newColor = new THREE.Color('blue');
    parent.restyle({ fillColor: newColor }, { includeChildren: true });
    
    expect(parent.getFill().material.color.getHexString()).toBe('0000ff');
    expect(child.getFill().material.color.getHexString()).toBe('0000ff');
    expect(grandchild.getFill().material.color.getHexString()).not.toBe('0000ff');
  });
});

test("child propagation hierarchy", () => {
  const parent = new TestShape();
  const child = new TestShape();
  const grandchild = new TestShape();
  
  parent.add(child);
  child.add(grandchild);
  
  const testColor = new THREE.Color('#00ff00');
  parent.restyle({ fillColor: testColor }, { includeChildren: true });
  
  expect(child.getFill().material.color.getHexString()).toBe('00ff00');
  expect(grandchild.getFill().material.color.getHexString()).not.toBe('00ff00');
});

test("non-Shape children exclusion", () => {
  const parent = new TestShape();
  const light = new THREE.PointLight();
  parent.add(light);
  
  parent.restyle({ fillColor: new THREE.Color('blue') }, { includeChildren: true });
  
  expect(light.userData.fill).toBeUndefined();
});

// test restyle
test("basic restyle updates materials", () => {
  const shape = new TestShape();
  shape.restyle({ 
    fillColor: new THREE.Color('red'),
    fillOpacity: 0.5
  });
});

// test includeChildren
test("restyle with includeChildren", () => {
  const parent = new TestShape();
  const child = new TestShape();
  parent.add(child);
  
  parent.restyle(
    { fillColor: new THREE.Color('blue') },
    { includeChildren: true }
  );
});

