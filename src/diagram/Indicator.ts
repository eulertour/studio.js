import * as THREE from "three";
import * as Geometry from "../geometry/index.js";
import * as Utils from "../utils.js";

interface IndicatorConfig {
  tickLength?: number;
}


export default class Indicator extends THREE.Group {
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
}