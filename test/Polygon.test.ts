import { describe, it, assert } from "vitest";
import { Geometry, THREE } from "../src/index.js";
import { ERROR_THRESHOLD } from "../src/constants.js";

const assertPolygonIsClosed = (polygon: Geometry.Polygon) => {
  const firstPoint = polygon.points[0];
  const lastPoint = polygon.points[polygon.points.length - 1];
  const firstToLastDistance = firstPoint.distanceTo(lastPoint);
  assert.isAtMost(firstToLastDistance, ERROR_THRESHOLD);
};

describe("Polygon", () => {
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, 0, 0),
  ];
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
        assert.isAtMost(difference, ERROR_THRESHOLD);  
      }
    });
  });

  describe("automatic closing", () => {
    describe("should automatically close the polygon if the first and last points are not the same", () => {
      it("should automatically close the polygon", () => {  
        assert.equal(polygon.points.length, 4);
        assertPolygonIsClosed(polygon);
      });

      it("should not mutate the input points", () => {
        assert.equal(points.length, 3);
      });
    });

    it("shouldn't close the polygon if the first and last points are the same", () => {
      const closedPoints = [
        ...points,
        points[points.length - 1].clone(),
      ];
      const closedPolygon = new Geometry.Polygon(closedPoints);

      assert.equal(closedPolygon.points.length, 4);
      assertPolygonIsClosed(closedPolygon);
    });
  });
});
