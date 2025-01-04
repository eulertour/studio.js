import { Geometry } from "../src/index.js";
import { describe, it, assert } from "vitest";
import * as THREE from "three";

describe("Square", () => {
  const square = new Geometry.Square(2);

  describe("attributes", () => {
    it("should have a width and a height attribute", () => {
      const attributes = square.getAttributes();
      assert.containsAllKeys(attributes, ["width", "height"]);
    });

    it("should have the correct width attribute", () => {
      assert.equal(square.width, 2);
    });

    it("should have the correct height attribute", () => {
      assert.equal(square.height, 2);
    });
  });
});