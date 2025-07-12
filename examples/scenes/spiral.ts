import {
  Geometry,
  Animation,
  StudioScene,
  AnimationRepresentation,
} from "../../src/index.js";
import * as THREE from "three/webgpu";

export default class Scene implements StudioScene {
  animations?: Array<AnimationRepresentation>;
  line: Geometry.Polyline;
  square: Geometry.Square;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGPURenderer,
  ) {
    // const p1 = new Geometry.Point(new THREE.Vector2(0, 1), { stroke: false });
    // const p2 = new Geometry.Point(new THREE.Vector2(1, 1), { stroke: false });
    // scene.add(p1, p2);

    const resolution = 200;
    const revolutions = 5;
    const height = 5;
    const points = [];
    const f = (t: number) => {
      const r = height / 2;
      const x = r - 2 * t * r;
      const theta = Math.acos(x / r);
      const y = r * Math.sin(theta);

      return new THREE.Vector3(
        y * Math.cos(revolutions * 2 * Math.PI * t),
        THREE.MathUtils.lerp(-r, r, t),
        y * Math.sin(revolutions * 2 * Math.PI * t),
      );
    };
    for (let i = 0; i <= resolution; i++) {
      points.push(f(i / resolution));
    }
    this.line = new Geometry.Polyline(points, {
      strokeColor: new THREE.Color("blue"),
      strokeOpacity: 1,
      strokeWidth: 4,
      fillColor: new THREE.Color("blue"),
      fillOpacity: 0.5,
      // fill: false,
    });
    scene.add(this.line);

    this.square = new Geometry.Square(2, {
      // strokeColor: new THREE.Color("blue"),
      // strokeOpacity: 1.0,
      // strokeWidth: 6,
      fillColor: new THREE.Color("red"),
      fillOpacity: 1,
      stroke: false,
    });
    this.square.position.setZ(1);
    scene.add(this.square);

    this.animations = [
      new Animation.Animation((t) => {
        // square.restyle({
        //   strokeWidth: THREE.MathUtils.lerp(2, 6, t),
        // });
      }),
    ];
  }

  update(dt, t) {
    // this.line.rotation.y += dt;
  }
}
