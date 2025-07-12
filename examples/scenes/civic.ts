import { THREE } from "../../src/index.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

export default class RotatingCube {
  svgGroup: THREE.Group;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    // Create a group to hold the SVG shapes
    this.svgGroup = new THREE.Group();
    this.svgGroup.scale.set(0.01, -0.01, 0.01);
    this.scene.add(this.svgGroup);

    // Load the SVG
    const loader = new SVGLoader();
    loader.load(
      // URL of the SVG file
      '/examples/html/assets/CivicLogo.svg',
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
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // onError callback
      (error) => {
        console.error('An error occurred loading the SVG:', error);
      }
    );
  }

  update(deltaTime: number, elapsedTime: number) {
    // Rotate the SVG group
    // this.svgGroup.rotation.y += 0.5 * deltaTime;
  }
}