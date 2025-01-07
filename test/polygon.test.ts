import { describe, it, assert } from "vitest";
import { Geometry, THREE } from "../src/index.js";

describe("Polygon", () => {
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 0, 0)];
  const polygon = new Geometry.Polygon(points);

  describe("attributes", () => {
    it("should have a points attribute", () => {
      const attributes = polygon.getAttributes();
      assert.containsAllKeys(attributes, ["points"]);
    });

    it("should have the correct points attribute", () => {
      for (let i = 0; i < points.length; i++) {
        const testPoint = points[i];
        const polygonPoint = polygon.points[i];
        const difference = testPoint.sub(polygonPoint).length();
        assert.isAtMost(difference, 0.0001);  
      }
    });

  });
});
