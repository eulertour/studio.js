import { describe, it, assert } from "vitest";
import { Geometry, THREE } from "../src/index.js";

describe("Point", () => {
  const point = new Geometry.Point(new THREE.Vector3(0, 0, 0), { radius: 0.08 });

  describe("attributes", () => {
    it("should have a radius attribute", () => {
      const attributes = point.getAttributes();
      assert.containsAllKeys(attributes, ["radius"]);
    });

    it("should have the correct radius attribute", () => {
      assert.equal(point.radius, 0.08);
    });

  });
});