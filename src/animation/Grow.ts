import { Animation } from "./Animation.js";
import * as THREE from "three";

export default class Grow extends Animation {
    constructor(object: THREE.Object3D) {
        super(
            (elapsedTime) => {
                object.scale.set(elapsedTime, elapsedTime, elapsedTime);
            },
            { object, reveal: true },
        );
    }
}