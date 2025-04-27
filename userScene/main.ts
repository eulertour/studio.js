import {
  Geometry,
  StudioScene,
  AnimationRepresentation,
} from "../src/index.js";
import * as THREE from "three/webgpu";

const sinPoints = (t: number) => {
  const points = [];
  for (let x = -Math.PI; x <= Math.PI + 0.001; x += (2 * Math.PI) / 50) {
    points.push(new THREE.Vector3(x / 2, Math.sin(x + t), 0));
  }
  return points;
};

export default class Scene implements StudioScene {
  animations?: Array<AnimationRepresentation>;
  sine: Geometry.Polyline;

  solidClosedStrokeRange: THREE.Group;
  solidClosedStartEndRange: Geometry.Square;
  solidClosedStartRange: Geometry.Square;
  solidClosedEndRange: Geometry.Square;

  dashedClosedStrokeRange: THREE.Group;
  dashedClosedStartEndRange: Geometry.Square;
  dashedClosedStartRange: Geometry.Square;
  dashedClosedEndRange: Geometry.Square;

  dashedMovingStrokeRange: THREE.Group;
  dashedMovingClosedStartEndRange: Geometry.Square;
  dashedMovingClosedStartRange: Geometry.Square;
  dashedMovingClosedEndRange: Geometry.Square;

  dashedMovingDynamic: THREE.Group;
  dashedMovingDynamicClosedCircle: Geometry.Circle;
  dashedMovingDynamicClosedSquare: Geometry.Square;

  dashedMovingClosed: THREE.Group;
  dashedStaticClosed: THREE.Group;
  solidStaticClosed: THREE.Group;

  staticSolidArrow: Geometry.Polyline;
  staticDashedArrow: Geometry.Polyline;
  staticDashedMovingArrow: Geometry.Polyline;
  drawnSolidArrow: Geometry.Polyline;
  drawnDashedArrow: Geometry.Polyline;
  drawnDashedMovingArrow: Geometry.Polyline;
  drawnSolidArrowStaticTips: Geometry.Polyline;
  drawnDashedArrowStaticTips: Geometry.Polyline;
  drawnDashedMovingArrowStaticTips: Geometry.Polyline;

  arrowCircle: Geometry.Circle;
  arrowSquare: Geometry.Square;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGPURenderer,
  ) {
    const screenWidth = camera.right - camera.left;
    const screenHeight = camera.top - camera.bottom;

    const firstRow = screenHeight / 4;
    const secondRow = -screenHeight / 4;
    const firstColumn = (-3 * screenWidth) / 8;
    const secondColumn = -screenWidth / 8;
    const thirdColumn = screenWidth / 8;
    const fourthColumn = (3 * screenWidth) / 8;

    this.solidClosedStrokeRange = new THREE.Group();
    const solidStrokeRangeStyle = {
      strokeColor: new THREE.Color("purple"),
      strokeOpacity: 0.85,
    };

    this.solidClosedStartRange = new Geometry.Square(1, solidStrokeRangeStyle);
    this.solidClosedEndRange = new Geometry.Square(2, solidStrokeRangeStyle);
    this.solidClosedStartEndRange = new Geometry.Square(
      3,
      solidStrokeRangeStyle,
    );

    this.solidClosedStrokeRange.add(this.solidClosedStartRange);
    this.solidClosedStrokeRange.add(this.solidClosedEndRange);
    this.solidClosedStrokeRange.add(this.solidClosedStartEndRange);

    this.dashedClosedStrokeRange = new THREE.Group();
    const dashedStrokeRangeStyle = {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeDashes: {
        length: 0.5,
      },
    };

    this.dashedClosedStartRange = new Geometry.Square(
      1,
      dashedStrokeRangeStyle,
    );
    this.dashedClosedEndRange = new Geometry.Square(2, dashedStrokeRangeStyle);
    this.dashedClosedStartEndRange = new Geometry.Square(
      3,
      dashedStrokeRangeStyle,
    );

    this.dashedClosedStrokeRange.add(this.dashedClosedStartRange);
    this.dashedClosedStrokeRange.add(this.dashedClosedEndRange);
    this.dashedClosedStrokeRange.add(this.dashedClosedStartEndRange);

    this.dashedMovingDynamic = new THREE.Group();
    const dashedMovingDynamicClosedStyle = {
      strokeColor: new THREE.Color("orange"),
      strokeOpacity: 0.857,
    };

    this.dashedMovingDynamicClosedCircle = new Geometry.Circle(1.5, {
      ...dashedMovingDynamicClosedStyle,
      strokeDashes: {
        speed: 1,
        length: (2 * Math.PI * 1.5) / 8,
      },
    });
    this.dashedMovingDynamicClosedSquare = new Geometry.Square(1.5, {
      ...dashedMovingDynamicClosedStyle,
      strokeDashes: {
        speed: 1,
        length: 1,
      },
    });

    this.dashedMovingDynamic.add(this.dashedMovingDynamicClosedCircle);
    this.dashedMovingDynamic.add(this.dashedMovingDynamicClosedSquare);

    this.dashedMovingStrokeRange = new THREE.Group();
    const dashedMovingStrokeRangeStyle = {
      strokeColor: new THREE.Color("red"),
      strokeOpacity: 0.85,
      strokeDashes: {
        speed: 1,
        length: 0.5,
      },
    };

    this.dashedMovingClosedStartRange = new Geometry.Square(
      1,
      dashedMovingStrokeRangeStyle,
    );
    this.dashedMovingClosedEndRange = new Geometry.Square(
      2,
      dashedMovingStrokeRangeStyle,
    );
    this.dashedMovingClosedStartEndRange = new Geometry.Square(
      3,
      dashedMovingStrokeRangeStyle,
    );

    this.dashedMovingStrokeRange.add(this.dashedMovingClosedStartRange);
    this.dashedMovingStrokeRange.add(this.dashedMovingClosedEndRange);
    this.dashedMovingStrokeRange.add(this.dashedMovingClosedStartEndRange);

    this.dashedMovingClosed = new THREE.Group();
    const dashedMovingClosedStyle = {
      strokeColor: new THREE.Color("green"),
      strokeOpacity: 0.85,
      strokeDashes: {
        length: 0.5,
        speed: 1,
      },
    };

    let square1 = new Geometry.Square(1, dashedMovingClosedStyle);
    let square2 = new Geometry.Square(2, dashedMovingClosedStyle);
    let square3 = new Geometry.Square(3, dashedMovingClosedStyle);

    this.dashedMovingClosed.add(square1, square2, square3);

    this.dashedStaticClosed = new THREE.Group();
    const dashedStaticClosedStyle = {
      strokeColor: new THREE.Color("indigo"),
      strokeOpacity: 0.85,
      strokeDashes: {
        length: 0.5,
      },
    };

    square1 = new Geometry.Square(1, dashedStaticClosedStyle);
    square2 = new Geometry.Square(2, dashedStaticClosedStyle);
    square3 = new Geometry.Square(3, dashedStaticClosedStyle);

    this.dashedStaticClosed.add(square1, square2, square3);

    this.solidStaticClosed = new THREE.Group();
    const solidStaticClosedStyle = {
      strokeColor: new THREE.Color("slateblue"),
      strokeOpacity: 0.85,
    };

    square1 = new Geometry.Square(1, solidStaticClosedStyle);
    square2 = new Geometry.Square(2, solidStaticClosedStyle);
    square3 = new Geometry.Square(3, solidStaticClosedStyle);

    this.solidStaticClosed.add(square1, square2, square3);

    this.sine = new Geometry.Polyline(sinPoints(0), {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeDashes: {
        length: 0.35,
        speed: 1,
      },
    });

    this.solidStaticClosed.position.set(firstColumn, firstRow, 0);
    this.dashedStaticClosed.position.set(firstColumn, secondRow, 0);
    this.solidClosedStrokeRange.position.set(secondColumn, firstRow, 0);
    this.dashedMovingDynamic.position.set(thirdColumn, firstRow, 0);
    this.sine.position.set(fourthColumn, firstRow, 0);
    this.dashedClosedStrokeRange.position.set(secondColumn, secondRow, 0);
    this.dashedMovingStrokeRange.position.set(thirdColumn, secondRow, 0);
    this.dashedMovingClosed.position.set(fourthColumn, secondRow, 0);

    const withoutArrow = new THREE.Group();
    withoutArrow.scale.set(0.5, 0.5, 1);
    withoutArrow.position.set(-3.4, 2, 0);
    withoutArrow.add(
      this.solidStaticClosed,
      this.solidClosedStrokeRange,
      this.dashedClosedStrokeRange,
      this.dashedMovingDynamic,
      this.dashedMovingStrokeRange,
      this.dashedMovingClosed,
      this.dashedStaticClosed,
      this.sine,
    );
    scene.add(withoutArrow);

    const withArrow = new THREE.Group();
    withArrow.position.set(-2, 0, 0);

    const zigZagPoints = [
      new THREE.Vector3(-1.5, 0.35, 0),
      new THREE.Vector3(-0.75, 0.35, 0),
      new THREE.Vector3(-0.75, -0.35, 0),
      new THREE.Vector3(0, -0.35, 0),
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0.75, 0.35, 0),
      new THREE.Vector3(0.75, -0.35, 0),
      new THREE.Vector3(1.5, -0.35, 0),
    ];

    this.staticSolidArrow = new Geometry.Polyline(zigZagPoints, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: true,
    });

    this.staticDashedArrow = new Geometry.Polyline(zigZagPoints, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: true,
      strokeDashes: {
        length: 0.45,
      },
    });

    this.staticDashedMovingArrow = new Geometry.Polyline(zigZagPoints, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: true,
      strokeDashes: {
        length: 0.45,
        speed: 1,
      },
    });

    this.drawnSolidArrow = new Geometry.Polyline(zigZagPoints, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: true,
    });

    this.drawnDashedArrow = new Geometry.Polyline(zigZagPoints, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: true,
      strokeDashes: {
        length: 0.45,
      },
    });

    this.drawnDashedMovingArrow = new Geometry.Polyline(zigZagPoints, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: true,
      strokeDashes: {
        length: 0.45,
        speed: 1,
      },
    });

    this.drawnSolidArrowStaticTips = new Geometry.Polyline(zigZagPoints, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: { draw: false },
    });

    this.drawnDashedArrowStaticTips = new Geometry.Polyline(zigZagPoints, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: { draw: false },
      strokeDashes: {
        length: 0.45,
      },
    });

    this.drawnDashedMovingArrowStaticTips = new Geometry.Polyline(
      zigZagPoints,
      {
        strokeColor: new THREE.Color("blue"),
        strokeOpacity: 0.85,
        strokeArrow: { draw: false },
        strokeDashes: {
          length: 0.45,
          speed: 1,
        },
      },
    );

    this.arrowCircle = new Geometry.Circle(1.3, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: { draw: false },
    });

    this.arrowSquare = new Geometry.Square(1.15, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeArrow: { draw: false },
    });

    this.staticSolidArrow.position.set(-5, 1.25, 0);
    this.staticDashedArrow.position.set(-5, 0, 0);
    this.staticDashedMovingArrow.position.set(-5, -1.25, 0);
    this.drawnSolidArrow.position.set(0, 1.25, 0);
    this.drawnDashedArrow.position.set(0, 0, 0);
    this.drawnDashedMovingArrow.position.set(0, -1.25, 0);
    this.drawnSolidArrowStaticTips.position.set(5, 1.25, 0);
    this.drawnDashedArrowStaticTips.position.set(5, 0, 0);
    this.drawnDashedMovingArrowStaticTips.position.set(5, -1.25, 0);
    this.arrowCircle.position.set(3.5, 3.75, 0);
    this.arrowSquare.position.set(3.5, 3.75, 0);
    withArrow.add(
      this.staticSolidArrow,
      this.staticDashedArrow,
      this.staticDashedMovingArrow,
      this.drawnSolidArrow,
      this.drawnDashedArrow,
      this.drawnDashedMovingArrow,
      this.drawnSolidArrowStaticTips,
      this.drawnDashedArrowStaticTips,
      this.drawnDashedMovingArrowStaticTips,
      this.arrowCircle,
      this.arrowSquare,
    );
    withArrow.position.set(0, -1.75, 0);
    scene.add(withArrow);

    this.animations = [];
  }

  update(_, t: number) {
    const frequency = 1 / 8;
    const sinValue = Math.sin(2 * Math.PI * t * frequency);
    const cosValue = Math.cos(2 * Math.PI * t * frequency);
    const sinProportion = 0.5 + 0.5 * sinValue;
    const cosProportion = 0.5 + 0.5 * cosValue;

    this.solidClosedStartRange.restyle({
      strokeProportion: {
        start: 0,
        end: sinProportion,
      },
    });

    this.solidClosedEndRange.restyle({
      strokeProportion: {
        start: sinProportion,
        end: 1,
      },
    });

    this.solidClosedStartEndRange.restyle({
      strokeProportion: {
        start: Math.min(sinProportion, cosProportion),
        end: Math.max(sinProportion, cosProportion),
      },
    });

    this.dashedClosedStartRange.restyle({
      strokeProportion: {
        start: 0,
        end: sinProportion,
      },
    });

    this.dashedClosedEndRange.restyle({
      strokeProportion: {
        start: sinProportion,
        end: 1,
      },
    });

    this.dashedClosedStartEndRange.restyle({
      strokeProportion: {
        start: Math.min(sinProportion, cosProportion),
        end: Math.max(sinProportion, cosProportion),
      },
    });

    const quarter = t % 8;
    if (quarter < 2) {
      const t0 = quarter / 2;
      this.dashedMovingDynamicClosedCircle.restyle({
        strokeDashes: {
          length: (2 * Math.PI * 1.5) / (8 - 2 * t0),
        },
      });
      this.dashedMovingDynamicClosedSquare.restyle({
        strokeDashes: {
          length: 1 - t0 / 4,
        },
      });
    } else if (quarter < 4) {
      // do nothing
    } else if (quarter < 6) {
      const t0 = (quarter - 4) / 2;
      this.dashedMovingDynamicClosedCircle.restyle({
        strokeDashes: {
          length: (2 * Math.PI * 1.5) / (6 + 2 * t0),
        },
      });
      this.dashedMovingDynamicClosedSquare.restyle({
        strokeDashes: {
          length: 3 / 4 + t0 / 4,
        },
      });
    } else {
      // do nothing
    }

    this.dashedMovingClosedStartRange.restyle({
      strokeProportion: {
        start: 0,
        end: sinProportion,
      },
    });

    this.dashedMovingClosedEndRange.restyle({
      strokeProportion: {
        start: sinProportion,
        end: 1,
      },
    });

    this.dashedMovingClosedStartEndRange.restyle({
      strokeProportion: {
        start: Math.min(sinProportion, cosProportion),
        end: Math.max(sinProportion, cosProportion),
      },
    });

    this.sine.reshape(sinPoints(t));

    this.drawnSolidArrow.restyle({ strokeProportion: sinProportion });
    this.drawnDashedArrow.restyle({ strokeProportion: sinProportion });
    this.drawnDashedMovingArrow.restyle({ strokeProportion: sinProportion });
    this.drawnSolidArrowStaticTips.restyle({ strokeProportion: sinProportion });
    this.drawnDashedArrowStaticTips.restyle({
      strokeProportion: sinProportion,
    });
    this.drawnDashedMovingArrowStaticTips.restyle({
      strokeProportion: sinProportion,
    });
    this.arrowCircle.restyle({
      strokeProportion: sinProportion,
    });
    this.arrowSquare.restyle({
      strokeProportion: sinProportion,
    });
  }
}
