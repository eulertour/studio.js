import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class Shrink extends Animation {
    constructor(object: THREE.Object3D) {
        super(
            (elapsedTime) => {
                object.scale.set(1 - elapsedTime, 1 - elapsedTime, 1 - elapsedTime);
            },
            { object, reveal: true },
        );
    }
}