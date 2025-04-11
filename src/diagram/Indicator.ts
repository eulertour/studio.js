import * as THREE from "three";
import { Animation } from "../animation/index.js";
import * as Geometry from "../geometry/index.js";
import * as Utils from "../utils.js";

// Define config interface for Indicator
interface IndicatorConfig {
  tickLength?: number;
}

// Define the Indicator class
class Indicator extends THREE.Group {
  public startTick: Geometry.Line;
  public endTick: Geometry.Line;
  public stem: Geometry.Line; // Assuming Geometry.Line creates a stroke

  constructor(
    public start: THREE.Vector3,
    public end: THREE.Vector3,
    config: IndicatorConfig & Geometry.Style = {},
  ) {
    const { tickLength = 0.4 } = config;

    super();
    this.stem = Geometry.Line.centeredLine(start, end, config);

    const tickVector = new THREE.Vector3()
      .subVectors(end, start)
      .normalize()
      .applyAxisAngle(Utils.OUT, Math.PI / 2)
      .multiplyScalar(tickLength / 2);
    const negativeTickVector = tickVector.clone().multiplyScalar(-1);

    this.startTick = Geometry.Line.centeredLine(
      new THREE.Vector3().addVectors(start, tickVector),
      new THREE.Vector3().addVectors(start, negativeTickVector),
      config,
    );

    this.endTick = Geometry.Line.centeredLine(
      new THREE.Vector3().addVectors(end, tickVector),
      new THREE.Vector3().addVectors(end, negativeTickVector),
      config,
    );

    const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
    for (const mesh of [this.stem, this.startTick, this.endTick]) {
      mesh.position.sub(center);
      this.add(mesh);
    }
    this.position.copy(center);
  }

  // Grow animation for the indicator
  grow(config?: ConstructorParameters<typeof Animation>[1]): Animation {
    const vec = new THREE.Vector3().subVectors(this.end, this.start);
    this.startTick.position.set(0, 0, 0);
    this.endTick.position.set(0, 0, 0);
    const drawRange = (this.stem?.stroke?.material as THREE.ShaderMaterial | undefined)?.uniforms?.drawRange?.value;
    if (drawRange) {
        drawRange.set(0.5, 0.5);
    }

    return new Animation(
      (elapsedTime: number) => {
        const halfTime = elapsedTime / 2;
        const currentDrawRange = (this.stem?.stroke?.material as THREE.ShaderMaterial | undefined)?.uniforms?.drawRange?.value;
        if (currentDrawRange) {
            currentDrawRange.set(
              0.5 - halfTime,
              0.5 + halfTime,
            );
        }
        this.startTick.position.set(0, 0, 0).addScaledVector(vec, halfTime);
        this.endTick.position.set(0, 0, 0).addScaledVector(vec, -halfTime);
      },
      { object: this, ...config },
    );
  }
}

export { Indicator }; // Export the class
export type { IndicatorConfig }; // Export the type separately
