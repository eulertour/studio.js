import {
  Geometry,
  Animation,
  StudioScene,
  AnimationRepresentation,
  Diagram as StudioDiagram,
  component,
} from "../src/index.js";
import * as THREE from "three";

// export interface IDiagram extends THREE.Group {
//   triangle: Geometry.Polygon;
  // angle: StudioDiagram.Angle;
  // }

// class Diagram extends THREE.Group implements IDiagram {
//   @component accessor triangle: IDiagram["triangle"];
  // @component accessor angle: IDiagram["angle"];

  // constructor() {
  //   super();
  //   this.triangle = new Geometry.Polygon(
  //     [
  //       new THREE.Vector3(-1, -1, 0),
  //       new THREE.Vector3(1, 1, 0),
  //       new THREE.Vector3(1, -1, 0),
  //     ],
  //     {
  //       strokeWidth: 4,
  //       fillColor: new THREE.Color("red"),
  //       fillOpacity: 0.5,
  //       strokeColor: new THREE.Color("red"),
  //     },
  //   );
  //   // this.angle = new StudioDiagram.Angle(
  //   //   this.triangle.points[0],
  //   //   this.triangle.points[1],
  //   //   this.triangle.points[2],
  //   // );

  // }
  // }

export default class Scene implements StudioScene {
  animations?: Array<AnimationRepresentation>;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGLRenderer,
  ) {
    const triangle = new Geometry.Polygon(
      [
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(1, 1, 0),
        new THREE.Vector3(1, -1, 0),
      ],
      {
        strokeWidth: 4,
        fillColor: new THREE.Color("red"),
        fillOpacity: 0.5,
        strokeColor: new THREE.Color("red"),
      },
    );
    scene.add(triangle);

    const angle = new StudioDiagram.Angle(
      new THREE.Vector3(-1, -1, 0),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(1, -1, 0),
    );
    scene.add(angle);

    // const diagram = new Diagram();
    // scene.add(diagram);

    this.animations = [
      new Animation.Wait(),
      // new Animation.Grow(diagram.triangle),
      // new Animation.Animation((t, _) => {
      //   triangle.reshape([
      //     new THREE.Vector3(-1, -1, 0),
      //     new THREE.Vector3(1 + t, 1, 0),
      //     new THREE.Vector3(1, -1, 0),
      //   ]);
      // }),
    ];
  }
}
