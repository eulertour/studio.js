import { THREE } from "../../src/index.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

export default class RotatingCube {
  svgGroup: THREE.Group;
  textMesh: THREE.Mesh;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    this.renderer.setClearColor(0x1578CF);

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
      () => {},
      // onError callback
      (error) => {
        console.error('An error occurred loading the SVG:', error);
      }
    );

    const fontLoader = new FontLoader();
    fontLoader.load("/examples/html/assets/Inter 28pt_Bold.json", (font) => {
      const geometry = new TextGeometry("Civic", {
        font: font,
        size: 0.5,
        depth: 0.1,
        curveSegments: 12,
        bevelEnabled: false,
      });
      
      const material = new THREE.MeshBasicMaterial({ color: "white" });
      this.textMesh = new THREE.Mesh(geometry, material);
      
      geometry.center();
      
      this.textMesh.position.set(0, -2, 0);
      this.textMesh.scale.set(3, 3, 3);
      
      this.scene.add(this.textMesh);
    });
  }

  update(deltaTime: number, elapsedTime: number) {
    // Rotate the SVG group
    // this.svgGroup.rotation.y += 0.5 * deltaTime;
  }
}