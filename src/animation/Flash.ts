import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class Flash extends Animation {
    constructor(
        object: THREE.Object3D,
        fadeOut: boolean = false,
        startTime: number,
        endTime: number,
    ) {
        super(
            (_elapsedTime) => {
                let alpha;
                if (!fadeOut) {
                    if (_elapsedTime < startTime) {
                        alpha = 0;
                    } else if (_elapsedTime === startTime) {
                        alpha = 1;
                    } else {
                        alpha = 1;
                    }
                } else {
                    const midpoint = (startTime + endTime) / 2;
                    if (_elapsedTime < startTime) {
                        alpha = 0;
                    } else if (_elapsedTime < midpoint) {
                        const t0 = (_elapsedTime - startTime) / (midpoint - startTime);
                        alpha = t0;
                    } else if (_elapsedTime < endTime) {
                        const t1 = (_elapsedTime - midpoint) / (endTime - midpoint);
                        alpha = 1 - t1;
                    } else {
                        alpha = 0;
                    }
                }

                object.setOpacity(alpha);
            },
            { object, reveal: true },
        );
    }
}
