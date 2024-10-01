import { assert } from "chai";
import { Geometry, THREE } from "../src/index";

describe("Line", () => {
  const line = new Geometry.Line(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 1, 1),
  );

  describe("attributes", () => {
    it("should have a start and end attribute", () => {
      const start = line.start;
      const startDifference = new THREE.Vector3(0, 0, 0).sub(start).length();
      assert.isAtMost(startDifference, 0.001);

      const end = line.end;
      const endDifference = new THREE.Vector3(1, 1, 1).sub(end).length();
      assert.isAtMost(endDifference, 0.001);
    });
  });
});
