import { THREE } from "@eulertour/studio";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
export default class Example {
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
        Object.defineProperty(this, "textMesh", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const loader = new FontLoader();
        loader.load("/examples/html/assets/Inter 28pt_Bold.json", (font) => {
            const geometry = new TextGeometry("hello", {
                font: font,
                size: 0.5,
                depth: 0.1,
                curveSegments: 12,
                bevelEnabled: false,
            });
            const material = new THREE.MeshBasicMaterial({ color: "black" });
            this.textMesh = new THREE.Mesh(geometry, material);
            geometry.center();
            this.textMesh.scale.set(3, 3, 3);
            this.scene.add(this.textMesh);
        });
    }
    update(dt) {
    }
}
//# sourceMappingURL=text.js.map