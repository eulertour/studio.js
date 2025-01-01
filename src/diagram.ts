import THREE from "./three.js";
import { Animation } from "./animation.js";
import * as Geometry from "./geometry.js";
import * as Utils from "./utils.js";

interface IndicatorConfig {
  tickLength?: number;
}

class Indicator extends THREE.Group {
  public startTick: Geometry.Line;
  public endTick: Geometry.Line;
  public stem;

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

  grow(config?): Animation {
    const vec = new THREE.Vector3().subVectors(this.end, this.start);
    this.startTick.position.set(0, 0, 0);
    this.endTick.position.set(0, 0, 0);
    this.stem.stroke.material.uniforms.drawRange.value.set(0.5, 0.5);
    return new Animation(
      (elapsedTime: number) => {
        const halfTime = elapsedTime / 2;
        this.stem.stroke.material.uniforms.drawRange.value.set(
          0.5 - halfTime,
          0.5 + halfTime,
        );
        this.startTick.position.set(0, 0, 0).addScaledVector(vec, halfTime);
        this.endTick.position.set(0, 0, 0).addScaledVector(vec, -halfTime);
      },
      { object: this, ...config },
    );
  }
}

class CongruentLine extends THREE.Group {
  constructor(
    ticks: number,
    start: THREE.Vector3,
    end: THREE.Vector3,
    config: Geometry.Style & {
      tickLength?: number;
      spacing?: number;
    } = {},
  ) {
    config = Object.assign({ tickLength: 0.25, spacing: 0.15 }, config);
    super();
    const left = -(config.spacing * (ticks - 1)) / 2;
    for (let i = 0; i < ticks; i++) {
      const pos = left + config.spacing * i;
      const tick = new Geometry.Line(
        new THREE.Vector3(pos, -config.tickLength / 2, 0),
        new THREE.Vector3(pos, config.tickLength / 2, 0),
        config,
      );
      this.add(tick);
    }

    const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
    this.position.copy(center);

    const segmentVector = new THREE.Vector3().subVectors(end, start);
    this.rotation.z = Math.atan2(segmentVector.y, segmentVector.x);
  }
}

class CongruentAngle extends THREE.Group {
  constructor(
    arcs: number,
    point1: THREE.Vector3,
    point2: THREE.Vector3,
    point3: THREE.Vector3,
    public config: Geometry.Style & {
      minRadius?: number;
      spacing?: number;
    } = {},
  ) {
    config = {
      minRadius: 0.4,
      spacing: 0.15,
      ...config,
    };

    super();
    for (let i = 0; i < arcs; i++) {
      const arc = new Angle(point1, point2, point3, {
        radius: config.minRadius + i * config.spacing,
        ...config,
      });
      this.add(arc);
    }
  }
}

// TODO: Handle reflex angles.
class Angle extends Geometry.Arc {
  constructor(
    point1: THREE.Vector3,
    point2: THREE.Vector3,
    point3: THREE.Vector3,
    config: Geometry.Style & { radius?: number; reflex?: boolean } = {},
  ) {
    config = { radius: 0.4, reflex: false, ...config };
    const vector21 = new THREE.Vector3().subVectors(point1, point2);
    const vector23 = new THREE.Vector3().subVectors(point3, point2);

    const arcAngle = vector21.angleTo(vector23);
    let arcRotation: number;
    // TODO: Handle 180 degree angles
    if (vector21.positiveAngleTo(vector23) < Math.PI) {
      arcRotation = Utils.RIGHT.positiveAngleTo(vector21);
    } else {
      arcRotation = Utils.RIGHT.positiveAngleTo(vector23);
    }

    super(config.radius, arcAngle, config);
    this.position.copy(point2);
    this.rotateZ(arcRotation);
  }
}

class RightAngle extends Geometry.Polyline {
  constructor(
    point1: THREE.Vector3,
    point2: THREE.Vector3,
    point3: THREE.Vector3,
    config: Geometry.Style & { sideLength?: number } = {},
  ) {
    config = { sideLength: 0.35, ...config };
    const vector21 = new THREE.Vector3()
      .subVectors(point1, point2)
      .setLength(config.sideLength);
    const vector23 = new THREE.Vector3()
      .subVectors(point3, point2)
      .setLength(config.sideLength);

    super(
      [
        new THREE.Vector3().addVectors(point2, vector21),
        new THREE.Vector3().add(point2).add(vector21).add(vector23),
        new THREE.Vector3().addVectors(point2, vector23),
      ],
      config,
    );
  }
}

export { Indicator, Angle, RightAngle, CongruentLine, CongruentAngle };
