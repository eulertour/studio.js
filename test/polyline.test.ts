import { describe, it, assert } from "vitest";
import { MeshLine } from "../src/MeshLine/index.js";
import { Geometry, THREE } from "../src/index.js";

describe("Polyline", () => {
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 0, 0)];
  const polyline = new Geometry.Polyline(points);

  describe("attributes", () => {
    it("should have a points attribute", () => {
      const attributes = polyline.getAttributes();
      assert.containsAllKeys(attributes, ["points"]);
    });

    it("should have the correct points attribute", () => {
      for (let i = 0; i < points.length; i++) {
        const testPoint = points[i];
        const polylinePoint = polyline.points[i];
        const difference = testPoint.sub(polylinePoint).length();
        assert.isAtMost(difference, 0.0001);  
      }
    });

  });
});
