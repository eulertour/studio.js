import * as THREE from "three/webgpu";
import { ShaderNodeObject, uniform } from "three/tsl";

const ATLAS_RESOLUTION = 1024;

enum DashType {
  START = 1,
  BODY = 0,
  END = -1,
}

const indexOrThrow = <T>(array: T[], i: number) => {
  const value = array[i];
  if (value === undefined) {
    throw new Error("Invalid array access");
  }
  return value;
};

export default class DashAtlas {
  atlas: THREE.DataTexture;
  period: ShaderNodeObject<THREE.UniformNode<number>>;

  constructor(pattern: number[]) {
    this.period = uniform(this.getPeriod(pattern));

    const atlasData = this.generateAtlasData(pattern);
    this.atlas = new THREE.DataTexture(atlasData, ATLAS_RESOLUTION, 1);
    this.atlas.needsUpdate = true;
  }

  getPeriod(pattern: number[]) {
    let period = 0;
    for (const patternSection of pattern) {
      period += patternSection;
    }
    return period;
  }

  computeSegmentBoundaries(pattern: number[]) {
    let segmentBoundaries: number[] = [];
    let currentPosition = 0;
    for (let i = 0; i < pattern.length + 2; i += 2) {
      let onSegmentLength = indexOrThrow(pattern, i % pattern.length);
      let offSegmentLength = indexOrThrow(pattern, (i + 1) % pattern.length);
      segmentBoundaries.push(
        currentPosition,
        currentPosition + onSegmentLength,
      );
      currentPosition += onSegmentLength + offSegmentLength;
    }
    return segmentBoundaries;
  }

  generateAtlasData(pattern: number[]) {
    if (pattern.length % 2 !== 0) {
      throw new Error("Dash pattern length must be a multiple of 2");
    }

    const data = new Int8Array(4 * ATLAS_RESOLUTION);
    const period = this.getPeriod(pattern);
    const segmentBoundaries = this.computeSegmentBoundaries(pattern);

    for (let i = 0; i < ATLAS_RESOLUTION; i++) {
      const xPosition = period * (i / (ATLAS_RESOLUTION - 1));

      let closestBoundaryIndex = -1;
      let closestBoundaryDistance = Infinity;
      for (let i = 0; i < segmentBoundaries.length; i++) {
        const segmentBoundary = indexOrThrow(segmentBoundaries, i);
        const boundaryDistance = Math.abs(segmentBoundary - xPosition);
        if (boundaryDistance < closestBoundaryDistance) {
          closestBoundaryIndex = i;
          closestBoundaryDistance = boundaryDistance;
        }
      }

      let dashTypeOrClosestBoundaryType: number;
      let closestBoundaryDashStart: number;
      let closestBoundaryDashEnd: number;
      let closestBoundaryIsSegmentStart = closestBoundaryIndex % 2 === 0;
      const closestBoundary = indexOrThrow(
        segmentBoundaries,
        closestBoundaryIndex,
      );
      if (closestBoundaryIsSegmentStart) {
        const closestBoundarySegmentEnd = indexOrThrow(
          segmentBoundaries,
          closestBoundaryIndex + 1,
        );
        dashTypeOrClosestBoundaryType =
          xPosition <= closestBoundary ? DashType.START : DashType.BODY;
        closestBoundaryDashStart = closestBoundary;
        closestBoundaryDashEnd = closestBoundarySegmentEnd;
      } else {
        const closestBoundarySegmentStart = indexOrThrow(
          segmentBoundaries,
          closestBoundaryIndex - 1,
        );
        dashTypeOrClosestBoundaryType =
          xPosition > closestBoundary ? DashType.END : DashType.BODY;
        closestBoundaryDashStart = closestBoundarySegmentStart;
        closestBoundaryDashEnd = closestBoundary;
      }
      data[4 * i] = closestBoundary;
      data[4 * i + 1] = dashTypeOrClosestBoundaryType;
      data[4 * i + 2] = closestBoundaryDashStart;
      data[4 * i + 3] = closestBoundaryDashEnd;
      // console.log(data[4 * i], data[4 * i + 1], data[4 * i + 2], data[4 * i + 3]);
    }

    return data;
  }
}
