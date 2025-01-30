import { describe, it, assert } from "vitest";
import { Geometry } from "../src/index.js";

describe("Circle", () => {
  const circle = new Geometry.Circle(2);

  describe("attributes", () => {
    it("should have a radius attribute", () => {
      const attributes = circle.getAttributes();
      assert.containsAllKeys(attributes, ["radius"]);
    });

    it("should have the correct radius attribute", () => {
      assert.equal(circle.radius, 2);
    });

  });
});
