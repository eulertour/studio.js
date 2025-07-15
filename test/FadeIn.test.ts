import { Geometry, Animation } from "../src/index.js";
import { describe, it, expect, beforeEach } from "vitest";

const round = (number: number) =>
  Math.round((number + Number.EPSILON) * 100) / 100;

const checkFading = (animation: Animation.FadeIn, testData) => {
  for (const data of testData) {
    animation.update(data.t);
    for (const [mesh, expectedOpacity] of data.expectedOpacities) {
      expect(round(mesh.material.opacity)).toEqual(expectedOpacity);
    }
  }
};

describe("FadeIn", () => {
  it("includes descendants by default", () => {
    const shape = new Geometry.Square(1);
    const child = new Geometry.Circle(1);
    shape.add(child);

    const animation = new Animation.FadeIn(shape, {
      easing: (t: number) => t,
    });
    animation.startTime = 0;
    animation.endTime = 1;

    checkFading(animation, [
      {
        t: 0.1,
        expectedOpacities: [
          [shape.stroke, 0.1],
          [shape.fill, 0.0],
          [child.stroke, 0.1],
          [child.fill, 0.0],
        ],
      },
      {
        t: 0.5,
        expectedOpacities: [
          [shape.stroke, 0.5],
          [shape.fill, 0.0],
          [child.stroke, 0.5],
          [child.fill, 0.0],
        ],
      },
      {
        t: 1.0,
        expectedOpacities: [
          [shape.stroke, 1.0],
          [shape.fill, 0.0],
          [child.stroke, 1.0],
          [child.fill, 0.0],
        ],
      },
    ]);
  });

  it("preserves opacity by default", () => {
    const config = {
      fillOpacity: 0.8,
      strokeOpacity: 0.6,
    };
    const shape = new Geometry.Square(1, config);
    const child = new Geometry.Circle(1, config);
    shape.add(child);

    const animation = new Animation.FadeIn(shape, {
      easing: (t: number) => t,
    });
    animation.startTime = 0;
    animation.endTime = 1;

    checkFading(animation, [
      {
        t: 0.1,
        expectedOpacities: [
          [shape.stroke, 0.06],
          [shape.fill, 0.08],
          [child.stroke, 0.06],
          [child.fill, 0.08],
        ],
      },
      {
        t: 0.5,
        expectedOpacities: [
          [shape.stroke, 0.3],
          [shape.fill, 0.4],
          [child.stroke, 0.3],
          [child.fill, 0.4],
        ],
      },
      {
        t: 1.0,
        expectedOpacities: [
          [shape.stroke, 0.6],
          [shape.fill, 0.8],
          [child.stroke, 0.6],
          [child.fill, 0.8],
        ],
      },
    ]);
  });

  it("can exclude descendants", () => {
    const shape = new Geometry.Square(1);
    const child = new Geometry.Circle(1);
    shape.add(child);

    const animation = new Animation.FadeIn(shape, {
      easing: (t: number) => t,
      includeDescendants: false,
    });
    animation.startTime = 0;
    animation.endTime = 1;

    checkFading(animation, [
      {
        t: 0.1,
        expectedOpacities: [
          [shape.stroke, 0.1],
          [shape.fill, 0.0],
          [child.stroke, 1.0],
          [child.fill, 0.0],
        ],
      },
      {
        t: 0.5,
        expectedOpacities: [
          [shape.stroke, 0.5],
          [shape.fill, 0.0],
          [child.stroke, 1.0],
          [child.fill, 0.0],
        ],
      },
      {
        t: 1.0,
        expectedOpacities: [
          [shape.stroke, 1.0],
          [shape.fill, 0.0],
          [child.stroke, 1.0],
          [child.fill, 0.0],
        ],
      },
    ]);
  });

  it("can conceal ancestors", () => {
    const shape = new Geometry.Square(1);
    const child = new Geometry.Circle(1);
    shape.add(child);

    const animation = new Animation.FadeIn(child, {
      easing: (t: number) => t,
      concealAncestors: true,
    });
    animation.startTime = 0;
    animation.endTime = 1;

    checkFading(animation, [
      {
        t: 0.1,
        expectedOpacities: [
          [shape.stroke, 0.0],
          [shape.fill, 0.0],
          [child.stroke, 0.1],
          [child.fill, 0.0],
        ],
      },
      {
        t: 0.5,
        expectedOpacities: [
          [shape.stroke, 0.0],
          [shape.fill, 0.0],
          [child.stroke, 0.5],
          [child.fill, 0.0],
        ],
      },
      {
        t: 1.0,
        expectedOpacities: [
          [shape.stroke, 0.0],
          [shape.fill, 0.0],
          [child.stroke, 1.0],
          [child.fill, 0.0],
        ],
      },
    ]);
  });

  it("can use numeric target opacity", () => {
    const shape = new Geometry.Square(1);
    const child = new Geometry.Circle(1);
    shape.add(child);

    const animation = new Animation.FadeIn(shape, {
      easing: (t: number) => t,
      targetOpacity: 0.5,
    });
    animation.startTime = 0;
    animation.endTime = 1;

    checkFading(animation, [
      {
        t: 0.1,
        expectedOpacities: [
          [shape.stroke, 0.05],
          [shape.fill, 0.05],
          [child.stroke, 0.05],
          [child.fill, 0.05],
        ],
      },
      {
        t: 0.5,
        expectedOpacities: [
          [shape.stroke, 0.25],
          [shape.fill, 0.25],
          [child.stroke, 0.25],
          [child.fill, 0.25],
        ],
      },
      {
        t: 1.0,
        expectedOpacities: [
          [shape.stroke, 0.5],
          [shape.fill, 0.5],
          [child.stroke, 0.5],
          [child.fill, 0.5],
        ],
      },
    ]);
  });

  it("can use separate target opacities for stroke and fill", () => {
    const shape = new Geometry.Square(1);
    const child = new Geometry.Circle(1);
    shape.add(child);

    const animation = new Animation.FadeIn(shape, {
      easing: (t: number) => t,
      targetOpacity: {
        stroke: 0.9,
        fill: 0.8,
      },
    });
    animation.startTime = 0;
    animation.endTime = 1;

    checkFading(animation, [
      {
        t: 0.1,
        expectedOpacities: [
          [shape.stroke, 0.09],
          [shape.fill, 0.08],
          [child.stroke, 0.09],
          [child.fill, 0.08],
        ],
      },
      {
        t: 0.5,
        expectedOpacities: [
          [shape.stroke, 0.45],
          [shape.fill, 0.4],
          [child.stroke, 0.45],
          [child.fill, 0.4],
        ],
      },
      {
        t: 1.0,
        expectedOpacities: [
          [shape.stroke, 0.9],
          [shape.fill, 0.8],
          [child.stroke, 0.9],
          [child.fill, 0.8],
        ],
      },
    ]);
  });
});
