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
        const square = new studio_1.Geometry.Square(2);
        scene.add(square);
    }
}
exports.default = Example;
//# sourceMappingURL=square.js.map