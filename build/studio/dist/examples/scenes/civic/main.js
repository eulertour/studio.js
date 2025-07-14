import { THREE } from "@eulertour/studio";
import { loadSVG, loadText } from "./loaders.js";
export default class RotatingCube {
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
        Object.defineProperty(this, "svgGroup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textMesh", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.renderer.setClearColor(0x1578CF);
        // Load the SVG
        loadSVG({
            url: '/examples/html/assets/CivicLogo.svg',
            scene: this.scene,
            position: new THREE.Vector3(-2, 0, 0),
            scale: new THREE.Vector3(0.006, -0.006, 0.006),
            center: true
        }).then((svgGroup) => {
            this.svgGroup = svgGroup;
        });
        // Load the font and create text
        loadText({
            url: "/examples/html/assets/Inter 28pt_Bold.json",
            scene: this.scene,
            text: "Civic",
            size: 0.5,
            depth: 0.1,
            position: new THREE.Vector3(0.9, -0.1, 0),
            scale: new THREE.Vector3(2.2, 2.2, 2.2),
            color: "white"
        }).then((textMesh) => {
            this.textMesh = textMesh;
        });
    }
    update(_deltaTime, _elapsedTime) {
        // Rotate the SVG group
        // this.svgGroup.rotation.y += 0.5 * deltaTime;
    }
}
//# sourceMappingURL=main.js.map