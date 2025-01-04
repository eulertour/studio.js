import { describe, it, assert } from "vitest";
import { Geometry } from "../src/index.js";

describe("Arc", () => {
  const arc = new Geometry.Arc(2, Math.PI / 2);

  describe("attributes", () => {
    it("should have a radius, angle, and closed attribute", () => {
      const attributes = arc.getAttributes();
      assert.containsAllKeys(attributes, ["radius", "angle", "closed"]);
    });

    it("should have the correct radius attribute", () => {
      assert.equal(arc.radius, 2);
    });

    it("should have the corrent angle attribute", () => {
      assert.equal(arc.angle, Math.PI / 2);
    });

    it("should have the corrent closed attribute", () => {
      assert.isFalse(arc.closed);
    });
  });
});
