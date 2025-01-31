import { Animation } from "./Animation.js";
import * as THREE from "three";
import { getBoundingBoxCenter } from "../utils.js";

export default class MoveTo extends Animation {
  public start;
  public displacement;

  constructor(
    public target: THREE.Object3D,
    public obj: THREE.Object3D,
    config?: any,
  ) {
    super(
      (elapsedTime) => {
        obj.position
          .copy(this.start)
          .addScaledVector(this.displacement, elapsedTime);
      },
      { obj, reveal: true, ...config },
    );
  }

  setUp() {
    super.setUp();
    this.start = this.obj.position.clone();

    const final = new THREE.Vector3();
    const initial = new THREE.Vector3();
    this.obj.parent.worldToLocal(getBoundingBoxCenter(this.target, final));
    this.obj.parent.worldToLocal(getBoundingBoxCenter(this.obj, initial));
    this.displacement = new THREE.Vector3().subVectors(final, initial);
  }
}
