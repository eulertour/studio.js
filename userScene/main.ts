import {
  Geometry,
  Animation,
  StudioScene,
  AnimationRepresentation,
} from "../src/index.js";
import * as THREE from "three";

export default class Scene implements StudioScene {
  animations?: Array<AnimationRepresentation>;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGLRenderer,
  ) {
    const xOffset = 5;
    const yOffset = 1.25;
    const numSquares = 5;
    const squares = [];
    for (let i = 0; i < numSquares; i++) {
      const square = new Geometry.Square(1, {
        position: new THREE.Vector3(
          -xOffset / 2,
          (yOffset * (numSquares - 1)) / 2 - i * yOffset,
          0,
        ),
      });
      scene.add(square);
      squares.push(square);
    }

    this.animations = [
      new Animation.Stagger(
        [
          new Animation.Shift(squares[0], new THREE.Vector3(xOffset, 0, 0)),
          new Animation.Shift(squares[1], new THREE.Vector3(xOffset, 0, 0)),
          new Animation.Shift(squares[2], new THREE.Vector3(xOffset, 0, 0)),
          new Animation.Shift(squares[3], new THREE.Vector3(xOffset, 0, 0)),
          new Animation.Shift(squares[4], new THREE.Vector3(xOffset, 0, 0)),
        ],
        {
          staggerDuration: 0.2,
        },
      ),
    ];
  }
}
