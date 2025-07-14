import { THREE } from "@eulertour/studio";
import { createRightEdgeFadeAlphaMap, loadSVG, loadText } from "./utils.js";
import civicLogoSVG from './assets/CivicLogo.svg?raw';
import interBoldFont from './assets/Inter 28pt_Bold.json?raw';
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
        Object.defineProperty(this, "civicMesh", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "numberMesh", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.renderer.setClearColor(0x1578CF);
        this.svgGroup = loadSVG({
            content: civicLogoSVG,
        });
        this.svgGroup.position.set(-3.4, 0.7, 1);
        this.svgGroup.scale.set(0.005, -0.005, 0.005);
        this.scene.add(this.svgGroup);
        this.civicMesh = loadText({
            fontData: interBoldFont,
            text: "Civic",
            size: 0.5,
            depth: 0.1,
            color: "white"
        });
        this.civicMesh.position.set(-0.3, -0.1, -1);
        this.civicMesh.scale.set(2.0, 2.0, 2.0);
        this.scene.add(this.civicMesh);
        this.numberMesh = loadText({
            fontData: interBoldFont,
            text: "101",
            size: 0.5,
            depth: 0.1,
            color: "white"
        });
        this.numberMesh.position.set(2.5, -0.1, 0);
        this.numberMesh.scale.set(2.0, 2.0, 2.0);
        this.mask = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), new THREE.MeshBasicMaterial({
            color: 0x1578CF,
            alphaMap: createRightEdgeFadeAlphaMap(256, 256, 0.2),
            transparent: true
        }));
        this.mask.position.x -= 4.0;
        this.scene.add(this.mask);
    }
    update(deltaTime, elapsedTime) {
        const t = 4.6 * elapsedTime;
        const x = -1 * t ** 2 + 4.4 * t - 4;
        const v = -2 * t + 4.4;
        // Civic text movement
        if (v >= 0) {
            this.civicMesh.position.x = x;
        }
        else if (this.civicMesh.position.x > -0.25) {
            if (this.scene.children.includes(this.mask)) {
                this.scene.remove(this.mask);
            }
            this.civicMesh.position.x -= 7.5 * deltaTime;
            if (this.civicMesh.position.x < -0.25 + 0.4) {
                this.scene.add(this.numberMesh);
                if (Array.isArray(this.numberMesh.material)) {
                    throw new Error('Cannot set opacity: numberMesh has an array of materials');
                }
                this.numberMesh.material.opacity = -(this.civicMesh.position.x - (-0.25 + 0.4)) / 0.4;
                this.numberMesh.material.transparent = true;
            }
        }
        // Rotate the SVG group
        // this.svgGroup.rotation.y += 0.5 * deltaTime;
    }
}
//# sourceMappingURL=main.js.map