import * as THREE from "three";
import * as Geometry from "../geometry/index.js";


export default class CongruentLine extends THREE.Group {
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