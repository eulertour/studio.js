import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import { indexOrThrow } from "../../utils.js";
const ATLAS_RESOLUTION = 1024;
var DashType;
(function (DashType) {
    DashType[DashType["START"] = 1] = "START";
    DashType[DashType["BODY"] = 0] = "BODY";
    DashType[DashType["END"] = -1] = "END";
})(DashType || (DashType = {}));
export default class DashAtlas {
    constructor(pattern) {
        Object.defineProperty(this, "atlas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "period", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.period = uniform(this.getPeriod(pattern));
        const atlasData = this.generateAtlasData(pattern);
        this.atlas = new THREE.DataTexture(atlasData, ATLAS_RESOLUTION, 1);
        this.atlas.needsUpdate = true;
    }
    getPeriod(pattern) {
        let period = 0;
        for (const patternSection of pattern) {
            period += patternSection;
        }
        return period;
    }
    computeSegmentBoundaries(pattern) {
        let segmentBoundaries = [];
        let currentPosition = 0;
        for (let i = 0; i < pattern.length + 2; i += 2) {
            let onSegmentLength = indexOrThrow(pattern, i % pattern.length);
            let offSegmentLength = indexOrThrow(pattern, (i + 1) % pattern.length);
            segmentBoundaries.push(currentPosition, currentPosition + onSegmentLength);
            currentPosition += onSegmentLength + offSegmentLength;
        }
        return segmentBoundaries;
    }
    generateAtlasData(pattern) {
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
            let dashTypeOrClosestBoundaryType;
            let closestBoundaryDashStart;
            let closestBoundaryDashEnd;
            let closestBoundaryIsSegmentStart = closestBoundaryIndex % 2 === 0;
            const closestBoundary = indexOrThrow(segmentBoundaries, closestBoundaryIndex);
            if (closestBoundaryIsSegmentStart) {
                const closestBoundarySegmentEnd = indexOrThrow(segmentBoundaries, closestBoundaryIndex + 1);
                dashTypeOrClosestBoundaryType =
                    xPosition <= closestBoundary ? DashType.START : DashType.BODY;
                closestBoundaryDashStart = closestBoundary;
                closestBoundaryDashEnd = closestBoundarySegmentEnd;
            }
            else {
                const closestBoundarySegmentStart = indexOrThrow(segmentBoundaries, closestBoundaryIndex - 1);
                dashTypeOrClosestBoundaryType =
                    xPosition > closestBoundary ? DashType.END : DashType.BODY;
                closestBoundaryDashStart = closestBoundarySegmentStart;
                closestBoundaryDashEnd = closestBoundary;
            }
            data[4 * i] = closestBoundary;
            data[4 * i + 1] = dashTypeOrClosestBoundaryType;
            data[4 * i + 2] = closestBoundaryDashStart;
            data[4 * i + 3] = closestBoundaryDashEnd;
            // console.log(
            //   data[4 * i],
            //   data[4 * i + 1],
            //   data[4 * i + 2],
            //   data[4 * i + 3],
            // );
        }
        return data;
    }
}
//# sourceMappingURL=DashAtlas.js.map