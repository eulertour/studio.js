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

  singleSegmentArrow: Geometry.Line;
  multiSegmentArrow: Geometry.Polyline;

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
      strokeDashLength: 0.5,
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
      strokeOpacity: 0.85,
      strokeDashSpeed: 1,
    };

    this.dashedMovingDynamicClosedCircle = new Geometry.Circle(1.5, {
      ...dashedMovingDynamicClosedStyle,
      strokeDashLength: (2 * Math.PI * 1.5) / 8,
    });
    this.dashedMovingDynamicClosedSquare = new Geometry.Square(1.5, {
      ...dashedMovingDynamicClosedStyle,
      strokeDashLength: 1,
    });

    this.dashedMovingDynamic.add(this.dashedMovingDynamicClosedCircle);
    this.dashedMovingDynamic.add(this.dashedMovingDynamicClosedSquare);

    this.dashedMovingStrokeRange = new THREE.Group();
    const dashedMovingStrokeRangeStyle = {
      strokeColor: new THREE.Color("red"),
      strokeOpacity: 0.85,
      strokeDashSpeed: 1,
      strokeDashLength: 0.5,
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
      strokeDashLength: 0.5,
      strokeDashSpeed: 1,
    };

    let square1 = new Geometry.Square(1, dashedMovingClosedStyle);
    let square2 = new Geometry.Square(2, dashedMovingClosedStyle);
    let square3 = new Geometry.Square(3, dashedMovingClosedStyle);

    this.dashedMovingClosed.add(square1, square2, square3);

    this.dashedStaticClosed = new THREE.Group();
    const dashedStaticClosedStyle = {
      strokeColor: new THREE.Color("indigo"),
      strokeOpacity: 0.85,
      strokeDashLength: 0.5,
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
      strokeDashLength: 0.35,
      strokeDashSpeed: 1,
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

    this.singleSegmentArrow = new Geometry.Line(
      new THREE.Vector3(-3, 0, 0),
      new THREE.Vector3(3, 0, 0),
      { strokeArrow: true },
    );
    this.multiSegmentArrow = new Geometry.Polyline(
      [
        new THREE.Vector3(-4, 0, 0),
        new THREE.Vector3(-4, -1, 0),
        new THREE.Vector3(4.5, -1, 0),
      ],
      { strokeArrow: true },
    );

    withArrow.add(this.singleSegmentArrow, this.multiSegmentArrow);
    withArrow.position.set(0, -2, 0);
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
        strokeDashLength: (2 * Math.PI * 1.5) / (8 - 2 * t0),
      });
      this.dashedMovingDynamicClosedSquare.restyle({
        strokeDashLength: 1 - t0 / 4,
      });
    } else if (quarter < 4) {
      // do nothing
    } else if (quarter < 6) {
      const t0 = (quarter - 4) / 2;
      this.dashedMovingDynamicClosedCircle.restyle({
        strokeDashLength: (2 * Math.PI * 1.5) / (6 + 2 * t0),
      });
      this.dashedMovingDynamicClosedSquare.restyle({
        strokeDashLength: 3 / 4 + t0 / 4,
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
    // this.line.restyle({ strokeDashOffset: t });
  }
}
