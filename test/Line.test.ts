import { describe, it, assert } from "vitest";
import WebGPUMeshLine from "../src/geometry/WebGPUMeshLine/index.js";
import { Geometry, THREE } from "../src/index.js";

describe("Line", () => {
  const line = new Geometry.Line(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 1, 1),
  );

  describe("attributes", () => {
    it("should have a start and end attribute", () => {
      const attributes = line.getAttributes();
      assert.containsAllKeys(attributes, ["start", "end"]);
    });

    it("should have the correct start attribute", () => {
      const start = line.start;
      const startDifference = new THREE.Vector3(0, 0, 0).sub(start).length();
      assert.isAtMost(startDifference, 0.001);
    });

    it("should have the corrent end attribute", () => {
      const end = line.end;
      const endDifference = new THREE.Vector3(1, 1, 1).sub(end).length();
      assert.isAtMost(endDifference, 0.001);
    });
  });

  it("should inherit from shape", () => {
    assert.instanceOf(line.fill, THREE.Mesh);
    assert.instanceOf(line.stroke, WebGPUMeshLine);
    assert.isArray(line.curveEndIndices);
  });
});

describe("Shape", () => {
  class TestShape extends Geometry.Shape {
    getAttributes() {
      return { test: true };
    }
  }
  const shape = new TestShape(getTestPoints());
  const defaults = Geometry.Shape.defaultStyleData();

  function getTestPoints() {
    return [new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1)];
  }

  describe("sets default style", () => {
    it("fillColor", () => {
      assert.equal(
        shape.fill?.material.color.getHexString(),
        defaults.fillColor.getHexString(),
      );
    });

    it("fillOpacity", () => {
      assert.equal(shape.fill?.material.opacity, defaults.fillOpacity);
      assert.isTrue(shape.fill?.material.transparent);
    });

    it("strokeColor", () => {
      assert.equal(
        shape.stroke?.material.uniforms.color.value.getHexString(),
        defaults.strokeColor.getHexString(),
      );
    });

    it("strokeOpacity", () => {
      assert.equal(shape.stroke?.material.opacity, defaults.strokeOpacity);
    });

    it("strokeWidth", () => {
      assert.equal(
        shape.stroke?.material.uniforms.width.value,
        defaults.strokeWidth,
      );
    });
  });

  describe("fill", () => {
    it("adds a fill by default", () => {
      assert.instanceOf(shape.fill, THREE.Mesh);
      assert.instanceOf(shape.fill?.material, THREE.MeshBasicMaterial);
      assert.instanceOf(shape.fill?.geometry, THREE.ShapeGeometry);
    });

    it("uses fillColor option", () => {
      const shape = new TestShape(getTestPoints(), {
        fillColor: new THREE.Color("#C458A5"),
      });

      assert.equal(shape.fill?.material.color.getHexString(), "c458a5");
    });

    it("uses fillOpacity option", () => {
      const shape = new TestShape(getTestPoints(), {
        fillOpacity: 0.65,
      });

      assert.equal(shape.fill?.material.opacity, 0.65);
      assert.isTrue(shape.fill?.material.transparent);
    });

    it("doesn't add a fill if config.fill is false", () => {
      const shape = new TestShape(getTestPoints(), {
        fill: false,
      });

      assert.isUndefined(shape.fill);
    });
  });

  describe("stroke", () => {
    it("adds a stroke by default", () => {
      assert.instanceOf(shape.stroke, WebGPUMeshLine);
    });

    it.skip("uses strokeColor option", () => {
      const shape = new TestShape(getTestPoints(), {
        strokeColor: new THREE.Color("#C458A5"),
      });

      assert.equal(shape.stroke?.material.color.getHexString(), "c458a5");
    });

    it("uses strokeOpacity option", () => {
      const shape = new TestShape(getTestPoints(), {
        strokeOpacity: 0.65,
      });

      assert.equal(shape.stroke?.material.uniforms.opacity.value, 0.65);
    });

    it("uses strokeWidth option", () => {
      const shape = new TestShape(getTestPoints(), {
        strokeWidth: 6,
      });

      assert.equal(shape.stroke?.material.uniforms.width.value, 6);
    });

    it.skip("doesn't add a stroke if config.stroke is false", () => {
      const shape = new TestShape(
        [new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1)],
        {
          stroke: false,
        },
      );

      assert.isUndefined(shape.stroke);
    });
  });

  it("returns attributes", () => {
    const attributes = shape.getAttributes();

    assert.isObject(attributes);
    assert.isTrue(attributes.test);
  });
});
