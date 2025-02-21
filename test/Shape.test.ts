import { assert } from "chai";
import * as THREE from "three";
import { Geometry } from "../src/index.js";

class TestShape extends Geometry.Shape {
  getAttributes(): object {
    return {};
  }
}

describe("Shape", () => {
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)];

  describe("restyle", () => {
    it("updates material uniforms", () => {
      const shape = new TestShape(points);
      const newStyle = {
        fillColor: new THREE.Color(0xff0000),
        fillOpacity: 0.5,
        strokeColor: new THREE.Color(0x00ff00),
        strokeOpacity: 0.7,
        strokeWidth: 2,
        strokeDashLength: 0.3,
        strokeDashOffset: 0.1,
        dashed: true,
      };

      shape.restyle(newStyle);

      // Check fill material
      assert.equal(shape.fill.material.color.getHex(), 0xff0000);
      assert.equal(shape.fill.material.opacity, 0.5);

      // Check stroke material
      assert.equal(shape.stroke.material.color.getHex(), 0x00ff00);
      assert.equal(shape.stroke.material.opacity, 0.7);
      assert.equal(shape.stroke.material.width, 2);
      assert.equal(shape.stroke.material.dashLength, 0.3);
      assert.equal(shape.stroke.material.dashOffset, 0.1);
    });

    it("applies style to children when includeChildren is true", () => {
      const parentShape = new TestShape(points);
      const childShape1 = new TestShape(points);
      const childShape2 = new TestShape(points);
      
      parentShape.add(childShape1);
      childShape1.add(childShape2);

      const newStyle = {
        fillColor: new THREE.Color(0xff0000),
        strokeColor: new THREE.Color(0x00ff00),
      };

      parentShape.restyle(newStyle, { includeChildren: true });

      // Check parent
      assert.equal(parentShape.fill.material.color.getHex(), 0xff0000);
      assert.equal(parentShape.stroke.material.color.getHex(), 0x00ff00);

      // Check first child
      assert.equal(childShape1.fill.material.color.getHex(), 0xff0000);
      assert.equal(childShape1.stroke.material.color.getHex(), 0x00ff00);

      // Check nested child
      assert.equal(childShape2.fill.material.color.getHex(), 0xff0000);
      assert.equal(childShape2.stroke.material.color.getHex(), 0x00ff00);
    });

    it("does not apply style to children when includeChildren is false", () => {
      const parentShape = new TestShape(points);
      const childShape = new TestShape(points);
      
      parentShape.add(childShape);

      const initialChildFillColor = childShape.fill.material.color.getHex();
      const initialChildStrokeColor = childShape.stroke.material.color.getHex();

      const newStyle = {
        fillColor: new THREE.Color(0xff0000),
        strokeColor: new THREE.Color(0x00ff00),
      };

      parentShape.restyle(newStyle, { includeChildren: false });

      // Check parent was updated
      assert.equal(parentShape.fill.material.color.getHex(), 0xff0000);
      assert.equal(parentShape.stroke.material.color.getHex(), 0x00ff00);

      // Check child was not updated
      assert.equal(childShape.fill.material.color.getHex(), initialChildFillColor);
      assert.equal(childShape.stroke.material.color.getHex(), initialChildStrokeColor);
    });
  });
}); 