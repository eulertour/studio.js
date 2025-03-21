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

  describe("Reshape", () => {
    const square = new Geometry.Square(1);
    const animation = square.Reshape(4);
    animation.addBefore(animation.before);
    animation.startTime = 2;
    animation.endTime = 3;

    it("interpolates sideLength", () => {
      animation.update(2);
      assert.equal(square.sideLength, 1);

      animation.update(2.5);
      assert.equal(square.sideLength, 2.5);

      animation.update(3);
      assert.equal(square.sideLength, 4);
    });
  });
});

