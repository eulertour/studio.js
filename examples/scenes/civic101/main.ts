import { THREE } from "../../../src/index.js";
import { loadSVG, loadText } from "./loaders.js";

export default class RotatingCube {
  svgGroup: THREE.Group;
  civicMesh: THREE.Mesh;
  numberMesh: THREE.Mesh;
  mask: THREE.Mesh;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public renderer: THREE.Renderer,
  ) {
    this.renderer.setClearColor(0x1578CF);

    // Load the SVG
    loadSVG({
      url: '/examples/html/assets/CivicLogo.svg',
      scene: this.scene,
      position: new THREE.Vector3(-2.9, 0, 1),
      scale: new THREE.Vector3(0.005, -0.005, 0.005),
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
      position: new THREE.Vector3(-0.3, -0.1, -1),
      scale: new THREE.Vector3(2.0, 2.0, 2.0),
      color: "white"
    }).then((civicMesh) => {
      this.civicMesh = civicMesh;
    });

    loadText({
      url: "/examples/html/assets/Inter 28pt_Bold.json",
      scene: this.scene,
      text: "101",
      size: 0.5,
      depth: 0.1,
      position: new THREE.Vector3(2.5, -0.1, 0),
      scale: new THREE.Vector3(2.0, 2.0, 2.0),
      color: "white"
    }).then((numberMesh) => {
      this.numberMesh = numberMesh;
      this.scene.remove(numberMesh);
    });
    
    function createRightEdgeFadeAlphaMap(width, height, fadePercentage = 0.3) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext('2d');
      if (context === null) {
        throw new Error('Failed to get canvas context');
      }
      
      // Create gradient from left (white/opaque) to right (black/transparent)
      const gradient = context.createLinearGradient(0, 0, width, 0);
      
      // Solid opacity for most of the plane
      const fadeStartPosition = 1 - fadePercentage;
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(fadeStartPosition, 'white');
      gradient.addColorStop(1, 'black');
      
      // Fill canvas with gradient
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      
      // Convert canvas to Three.js texture
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      return texture;
    }

    // Create your mask with the alpha map
    const maskGeometry = new THREE.PlaneGeometry(5, 3);
    const alphaMap = createRightEdgeFadeAlphaMap(256, 256, 0.2); // 20% fade on right edge

    const maskMaterial = new THREE.MeshBasicMaterial({ 
      // color: 0xff78CF,
      color: 0x1578CF,
      alphaMap: alphaMap,
      transparent: true
    });
    
    this.mask = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 3),
      maskMaterial
      // new THREE.MeshBasicMaterial({ color: 0x1578CF })
    );
    this.mask.position.x -= 4.0;
    this.scene.add(this.mask);
  }

  update(deltaTime: number, elapsedTime: number) {
    const t = 4.6 * elapsedTime;
    const x = -1 * t**2 + 4.4 * t - 4;
    const v = -2 * t + 4.4;

    // Civic text movement
    if (v >= 0) {
      this.civicMesh.position.x = x;
    } else if (this.civicMesh.position.x > -0.3) {
      if (this.scene.children.includes(this.mask)) {
        this.scene.remove(this.mask);
      }

      this.civicMesh.position.x -= 7.5 * deltaTime;
      if (this.civicMesh.position.x < -0.3 + 0.4) {
        this.scene.add(this.numberMesh);

        if (Array.isArray(this.numberMesh.material)) {
          throw new Error('Cannot set opacity: numberMesh has an array of materials');
        }
        this.numberMesh.material.opacity = -(this.civicMesh.position.x - (-0.3 + 0.4)) / 0.4;
        this.numberMesh.material.transparent = true;
      }
    }
    

    // Rotate the SVG group
    // this.svgGroup.rotation.y += 0.5 * deltaTime;
  }
}