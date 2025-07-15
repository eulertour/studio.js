"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const studio_1 = require("@eulertour/studio");
class Example {
    constructor(scene, camera, renderer) {
        Object.defineProperty(this, "scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: scene
        });
        Object.defineProperty(this, "camera", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: camera
        });
        Object.defineProperty(this, "renderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: renderer
        });
        const arrow = new studio_1.Geometry.Arrow(new studio_1.THREE.Vector3(-1, -1, 0), new studio_1.THREE.Vector3(1, 1, 0));
        scene.add(arrow);
    }
}
exports.default = Example;
//# sourceMappingURL=arrow.js.map