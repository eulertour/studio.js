import * as THREE from "three";
import { Animation } from "../animation/index.js";
import * as Geometry from "../geometry/index.js";
import * as Utils from "../utils.js";
import * as Text from "../text.js";
import Angle from "../angle.js";

interface IndicatorConfig {
  tickLength?: number;
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

    this.moveToSegment(start, end);
  }

  moveToSegment(start: THREE.Vector3, end: THREE.Vector3) {
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

class Number extends THREE.Group {
  static geometries = Number.initializeGeometries();
  meshes: THREE.Mesh[] = [];
  material = new THREE.MeshBasicMaterial({ color: "black" });
  decimals: number;
  centerData = {
    center: new THREE.Vector3(),
    box: new THREE.Box3(),
    offset: new THREE.Vector3(),
    worldPosition: new THREE.Vector3(),
  };

  constructor(
    value = 0,
    config: { color?: THREE.ColorRepresentation; decimals?: number } = {},
  ) {
    const fullConfig = {
      color: config.color ?? "black",
      decimals: config.decimals ?? 2,
    };

    super();
    this.material.color = new THREE.Color(fullConfig.color);
    this.decimals = fullConfig.decimals;
    this.scale.set(0.0008, -0.0008, 0.0008);
    this.updateFromValue(value);
  }

  reshape(
    value: number,
    config: { color?: THREE.ColorRepresentation; decimals?: number } = {},
  ) {
    const fullConfig = {
      color: config.color ?? "black",
      decimals: config.decimals ?? 2,
    };
    this.material.color = new THREE.Color(fullConfig.color);
    this.decimals = fullConfig.decimals;
    this.clear();
    this.updateFromValue(value);
  }

  updateFromValue(value: number) {
    const characters = value.toFixed(this.decimals).split("");
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];

      if (character === undefined) {
        throw new Error(`No character at index ${i}`);
      }

      const geometry = Number.geometries.get(character);
      if (geometry === undefined) {
        throw new Error(`Character ${character} isn't supported in Number.`);
      }

      let mesh = this.meshes[i];
      if (mesh !== undefined) {
        mesh.geometry = geometry;
      } else {
        mesh = new THREE.Mesh(geometry, this.material);
        this.meshes.push(mesh);
      }
      this.add(mesh);
    }

    for (let i = 1; i < this.children.length; i++) {
      const previousChild = this.children[i - 1];
      const currentChild = this.children[i];
      currentChild.moveNextTo(previousChild, Utils.RIGHT, 0.025);
    }

    this.centerData.worldPosition.copy(this.position);
    this.localToWorld(this.centerData.worldPosition);

    this.centerData.box.setFromObject(this).getCenter(this.centerData.center);
    this.centerData.center.y *= -1;

    this.centerData.offset
      .subVectors(this.centerData.worldPosition, this.centerData.center)
      .multiplyScalar(1 / 0.0008);

    this.children.forEach((child) =>
      child.position.add(this.centerData.offset),
    );
  }

  static extractGeometry(textShape: Text.Text) {
    return textShape.children[0].children[0].children[0]
      .geometry as THREE.ShapeGeometry;
  }

  static initializeGeometries() {
    const geometryMap = new Map<string, THREE.ShapeGeometry>();

    for (let i = 0; i < 10; i++) {
      const numberShape = new Text.Text(i.toString());
      const numberGeometry = Number.extractGeometry(numberShape);
      geometryMap.set(i.toString(), numberGeometry);
    }

    const decimalShape = new Text.Text(".");
    const decimalGeometry = Number.extractGeometry(decimalShape);
    geometryMap.set(".", decimalGeometry);

    return geometryMap;
  }
}

export { Indicator, Angle, RightAngle, CongruentLine, CongruentAngle, Number };
