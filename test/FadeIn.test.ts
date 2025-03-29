import { Geometry, Animation } from "../src/index.js";
import { describe, it, expect, beforeEach } from "vitest";

const checkFading = (
  animation: Animation.FadeIn,
  shape: Geometry.Shape,
  config: { includeDescendants?: boolean } = {},
) => {
  config = { includeDescendants: true, ...config };
  for (let i = 0; i <= 5; i++) {
    const t = 0.2 * i;
    animation.update(t);
    expect(shape.fill?.material.opacity).toEqual(t);
  }
};

describe("FadeIn", () => {
  describe("works on shapes", () => {
    it("without any family", () => {
      const shape = new Geometry.Square(1);
      const animation = new Animation.FadeIn(shape, {
        easing: (t: number) => t,
      });
      animation.startTime = 0;
      animation.endTime = 1;
      // checkFading(animation, shape);
    });

    describe("with a family", () => {
      it("can animate a child with its parents", () => {
        const shape = new Geometry.Square(1);
        shape.add(new Geometry.Circle(1));
        const animation = new Animation.FadeIn(shape, {
          easing: (t: number) => t,
          includeDescendants: true,
        });
        animation.startTime = 0;
        animation.endTime = 1;
        // checkFading(animation, shape, { includeDescendants: true });
      });

      it("can animate a child without its parents", () => {});
    });
  });
});
