import {
  Geometry,
  Animation,
  StudioScene,
  AnimationRepresentation,
} from "../src/index.js";
import * as THREE from "three/webgpu";

export default class Scene implements StudioScene {
  animations?: Array<AnimationRepresentation>;
  line: Geometry.Polyline;
  line4: Geometry.Line;

  solidStrokeRange: THREE.Group;
  solidClosedStartEndRange: Geometry.Square;
  solidClosedStartRange: Geometry.Square;
  solidClosedEndRange: Geometry.Square;

  dashedStrokeRange: THREE.Group;
  dashedClosedStartEndRange: Geometry.Square;
  dashedClosedStartRange: Geometry.Square;
  dashedClosedEndRange: Geometry.Square;

  dashedMovingClosed: THREE.Group;
  dashedMovingClosedCircle: Geometry.Circle;
  dashedMovingClosedSquare: Geometry.Square;

  dashedMovingStrokeRange: THREE.Group;
  dashedMovingClosedStartEndRange: Geometry.Square;
  dashedMovingClosedStartRange: Geometry.Square;
  dashedMovingClosedEndRange: Geometry.Square;

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

    this.solidStrokeRange = new THREE.Group();
    this.solidStrokeRange.position.set(firstColumn, firstRow, 0);
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

    this.solidStrokeRange.add(this.solidClosedStartRange);
    this.solidStrokeRange.add(this.solidClosedEndRange);
    this.solidStrokeRange.add(this.solidClosedStartEndRange);
    scene.add(this.solidStrokeRange);

    this.dashedStrokeRange = new THREE.Group();
    this.dashedStrokeRange.position.set(firstColumn, secondRow, 0);
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

    this.dashedStrokeRange.add(this.dashedClosedStartRange);
    this.dashedStrokeRange.add(this.dashedClosedEndRange);
    this.dashedStrokeRange.add(this.dashedClosedStartEndRange);
    scene.add(this.dashedStrokeRange);

    this.dashedMovingClosed = new THREE.Group();
    this.dashedMovingClosed.position.set(secondColumn, firstRow, 0);
    const dashedMovingClosedStyle = {
      strokeColor: new THREE.Color("orange"),
      strokeOpacity: 0.85,
      strokeDashSpeed: 1,
    };

    this.dashedMovingClosedCircle = new Geometry.Circle(1.5, {
      ...dashedMovingClosedStyle,
      strokeDashLength: (2 * Math.PI * 1.5) / 8,
    });
    this.dashedMovingClosedSquare = new Geometry.Square(1.5, {
      ...dashedMovingClosedStyle,
      strokeDashLength: 1,
    });

    this.dashedMovingClosed.add(this.dashedMovingClosedCircle);
    this.dashedMovingClosed.add(this.dashedMovingClosedSquare);
    scene.add(this.dashedMovingClosed);

    this.dashedMovingStrokeRange = new THREE.Group();
    this.dashedMovingStrokeRange.position.set(secondColumn, secondRow, 0);
    const dashedMovingStrokeRangeStyle = {
      strokeColor: new THREE.Color("red"),
      strokeOpacity: 0.85,
      strokeDashLength: 0.5,
      strokeDashSpeed: 1,
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
    scene.add(this.dashedMovingStrokeRange);

    const square2 = new Geometry.Square(2, {
      strokeOpacity: 0.75,
      strokeWidth: 5,
      strokeDashSpeed: 1,
      strokeDashLength: 0.5,
    });
    square2.position.x = screenWidth / 3;
    square2.position.y = screenHeight / 4;
    scene.add(square2);

    const line2 = new Geometry.Polyline(
      [
        new THREE.Vector3(0, -1.5, 0),
        new THREE.Vector3(0, 1.5, 0),
        new THREE.Vector3(0, -1.5, 0),
      ],
      {
        strokeColor: new THREE.Color("purple"),
        strokeOpacity: 0.85,
        strokeWidth: 5,
        strokeDashLength: 0.5,
        strokeDashSpeed: 1,
      },
    );
    line2.position.x = screenWidth / 3;
    line2.position.y = -screenHeight / 4;
    scene.add(line2);

    // WARN: This causes a render warning.
    const line3 = new Geometry.Line(
      new THREE.Vector3(-1.5, 1.5, 0),
      new THREE.Vector3(1.5, -1.5, 0),
      {
        strokeColor: new THREE.Color("purple"),
        strokeOpacity: 0.85,
        strokeWidth: 5,
        strokeDashLength: 0.5,
        strokeDashSpeed: 1,
      },
    );
    line3.position.x = 0;
    line3.position.y = -screenHeight / 4;
    scene.add(line3);

    const points = [
      new THREE.Vector3(-1, 1.5, 0),
      new THREE.Vector3(1, 0.75, 0),
      new THREE.Vector3(-1, -0.75, 0),
      new THREE.Vector3(1, -1.5, 0),
    ];
    this.line = new Geometry.Polyline(points, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 0.85,
      strokeDashLength: 0.75,
      strokeDashSpeed: 1,
    });
    this.line.position.set(thirdColumn, firstRow, 0);
    scene.add(this.line);
    this.animations = [
      [
        new Animation.Animation((t) => {
          this.line.reshape([
            new THREE.Vector3(-1 + 2 * t, 1.5, 0),
            new THREE.Vector3(1 - 2 * t, 0.75, 0),
            new THREE.Vector3(-1 + 2 * t, -0.75, 0),
            new THREE.Vector3(1 - 2 * t, -1.5, 0),
          ]);
        }),
      ],
      new Animation.Animation((t) => {
        this.line.reshape([
          new THREE.Vector3(1 - 2 * t, 1.5, 0),
          new THREE.Vector3(-1 + 2 * t, 0.75, 0),
          new THREE.Vector3(1 - 2 * t, -0.75, 0),
          new THREE.Vector3(-1 + 2 * t, -1.5, 0),
        ]);
      }),
      new Animation.Animation((t) => {
        this.line.reshape([
          new THREE.Vector3(-1 + 2 * t, 1.5, 0),
          new THREE.Vector3(1 - 2 * t, 0.75, 0),
          new THREE.Vector3(-1 + 2 * t, -0.75, 0),
          new THREE.Vector3(1 - 2 * t, -1.5, 0),
        ]);
      }),
      new Animation.Animation((t) => {
        this.line.reshape([
          new THREE.Vector3(1 - 2 * t, 1.5, 0),
          new THREE.Vector3(-1 + 2 * t, 0.75, 0),
          new THREE.Vector3(1 - 2 * t, -0.75, 0),
          new THREE.Vector3(-1 + 2 * t, -1.5, 0),
        ]);
      }),
      new Animation.Animation((t) => {
        this.line.reshape([
          new THREE.Vector3(-1 + 2 * t, 1.5, 0),
          new THREE.Vector3(1 - 2 * t, 0.75, 0),
          new THREE.Vector3(-1 + 2 * t, -0.75, 0),
          new THREE.Vector3(1 - 2 * t, -1.5, 0),
        ]);
      }),
    ];
  }

  update(_, t: number) {
    // t = 10.6
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
      this.dashedMovingClosedCircle.restyle({
        strokeDashLength: (2 * Math.PI * 1.5) / (8 - 2 * t0),
      });
      this.dashedMovingClosedSquare.restyle({
        strokeDashLength: 1 - t0 / 4,
      });
    } else if (quarter < 4) {
      // do nothing
    } else if (quarter < 6) {
      const t0 = (quarter - 4) / 2;
      this.dashedMovingClosedCircle.restyle({
        strokeDashLength: (2 * Math.PI * 1.5) / (6 + 2 * t0),
      });
      this.dashedMovingClosedSquare.restyle({
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
  }
}
