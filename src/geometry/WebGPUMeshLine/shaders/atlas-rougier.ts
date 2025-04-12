import { ShaderNodeObject, uniform } from "three/tsl";
import * as THREE from "three/webgpu";

enum DashType {
  START = 1,
  BODY = 0,
  END = -1,
}

const texelWidth = 1024;
const texelHeight = 1;
const atlasSize = texelWidth * texelHeight;

export class DashAtlas {
  atlas: THREE.DataTexture;
  period: ShaderNodeObject<THREE.UniformNode<number>>;

  constructor(pattern: number[]) {
    this.period = uniform(getPeriod(pattern));
    this.atlas = buildAtlas(pattern);
  }
}

const getPeriod = (pattern: number[]): number => {
  let period = 0;
  for (const patternSection of pattern) {
    period += patternSection;
  }
  return period;
};

const indexOrThrow = <T>(array: T[], i: number) => {
  const value = array[i];
  if (value === undefined) {
    throw new Error("Invalid array access");
  }
  return value;
};

const buildAtlas = (pattern: number[]): THREE.DataTexture => {
  const data = new Int8Array(4 * atlasSize);

  if (pattern.length % 2 !== 0) {
    throw new Error("Dash pattern length must be a multiple of 2");
  }

  let segmentBoundaries: number[] = [];
  let currentPosition = 0;
  for (let i = 0; i < pattern.length + 2; i += 2) {
    let onSegmentLength = indexOrThrow(pattern, i % pattern.length);
    let offSegmentLength = indexOrThrow(pattern, (i + 1) % pattern.length);
    segmentBoundaries.push(currentPosition, currentPosition + onSegmentLength);
    currentPosition += onSegmentLength + offSegmentLength;
  }

  let period = 0;
  for (const patternLength of pattern) {
    period += patternLength;
  }

  for (let i = 0; i < texelWidth; i++) {
    const xPosition = period * (i / (texelWidth - 1));

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

  const atlas = new THREE.DataTexture(data, texelWidth, texelHeight);
  atlas.needsUpdate = true;
  return atlas;
};