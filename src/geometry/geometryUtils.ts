import * as THREE from "three";
import { ERROR_THRESHOLD } from "../constants.js";

export const getArcPoints = (radius: number, angle: number, config: { closed?: boolean } = {}) => {
    let points = [];
    let negative = false;
    if (angle < 0) {
      negative = true;
      angle *= -1;
    }
    if (angle > 0) {
      for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
        points.push(
          new THREE.Vector3(
            radius * Math.cos(i),
            radius * Math.sin(i) * (negative ? -1 : 1),
            0,
          ),
        );
      }
    } else {
      points.push(
        new THREE.Vector3(radius, 0, 0),
        new THREE.Vector3(radius, 0, 0),
      );
    }
    if (config.closed) {
      points = [
        new THREE.Vector3(0, 0, 0),
        ...points,
        new THREE.Vector3(0, 0, 0),
      ];
    }
    return points;
}