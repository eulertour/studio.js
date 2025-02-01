import { Geometry } from "../src/index.js";
import { describe, it, assert } from "vitest";

describe("Rectangle", () => {
  const rectangle = new Geometry.Rectangle(4, 2);

  describe("attributes", () => {
    it("should have a width and a height attribute", () => {
      const attributes = rectangle.getAttributes();
      assert.containsAllKeys(attributes, ["width", "height"]);
    });

    it("should have the correct width attribute", () => {
      assert.equal(rectangle.width, 4);
    });

    it("should have the correct height attribute", () => {
      assert.equal(rectangle.height, 2);
    });
  });
});