import { THREE } from "@eulertour/studio";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
export default class SVGExample {
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
        // Create a group to hold the SVG shapes
        this.svgGroup = new THREE.Group();
        this.svgGroup.scale.set(1, -1, 1);
        this.scene.add(this.svgGroup);
        // Load the SVG
        const loader = new SVGLoader();
        loader.load(
        // URL of the SVG file
        '/examples/html/assets/test.svg', 
        // onLoad callback
        (data) => {
            const paths = data.paths;
            for (let i = 0; i < paths.length; i++) {
                const path = paths[i];
                const material = new THREE.MeshBasicMaterial({
                    color: path.color,
                    side: THREE.DoubleSide,
                    depthWrite: false
                });
                const shapes = SVGLoader.createShapes(path);
                for (let j = 0; j < shapes.length; j++) {
                    const shape = shapes[j];
                    const geometry = new THREE.ShapeGeometry(shape);
                    const mesh = new THREE.Mesh(geometry, material);
                    this.svgGroup.add(mesh);
                }
            }
            // Center the SVG without scaling (preserve 6x6 units)
            const box = new THREE.Box3().setFromObject(this.svgGroup);
            const center = box.getCenter(new THREE.Vector3());
            // Move to origin
            this.svgGroup.position.sub(center);
        }, 
        // onProgress callback
        () => { }, 
        // onError callback
        (error) => {
            console.error('An error occurred loading the SVG:', error);
        });
    }
    update(deltaTime, elapsedTime) {
        // The SVG remains static
    }
}
//# sourceMappingURL=svg.js.map