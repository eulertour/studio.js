import * as THREE from "three/webgpu";
import { Shape } from "../src/geometry/index.js";
import { describe, beforeEach, test, expect } from "vitest";

// Mock class to test Shape since Shape is abstract
class TestShape extends Shape {
  constructor() {
    super([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]);
  }

  getAttributes() {
    return {};
  }
}

describe("Shape", () => {
  let shape: TestShape;

  beforeEach(() => {
    shape = new TestShape();
  });

  test("restyle updates uniforms", () => {
    const newStyle = {
      fillColor: new THREE.Color(0xff0000),
      strokeColor: new THREE.Color(0x00ff00),
    };
    shape.restyle(newStyle);

    expect(shape.fill.material.color).toEqual(newStyle.fillColor);
    expect(shape.stroke.material.uniforms.color.value).toEqual(
      newStyle.strokeColor,
    );
  });

  test("restyle with includeDescendents updates all children", () => {
    const childShape = new TestShape();
    shape.add(childShape);

    const newStyle = {
      fillColor: new THREE.Color(0x0000ff),
    };
    shape.restyle(newStyle, { includeDescendents: true });

    expect(childShape.fill.material.color).toEqual(newStyle.fillColor);
  });
});
