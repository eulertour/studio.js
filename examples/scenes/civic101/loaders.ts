import { THREE } from "../../../src/index.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

interface LoaderOptions {
  url: string;
  scene: THREE.Scene;
  onProgress?: (progress: ProgressEvent) => void;
}

interface SVGLoaderOptions extends LoaderOptions {
  scale?: THREE.Vector3;
  position?: THREE.Vector3;
  center?: boolean;
}

interface TextLoaderOptions extends LoaderOptions {
  text: string;
  size?: number;
  depth?: number;
  position?: THREE.Vector3;
  scale?: THREE.Vector3;
  color?: string | number;
}

export function loadSVG(options: SVGLoaderOptions): Promise<THREE.Group> {
  const { 
    url, 
    scene, 
    scale = new THREE.Vector3(0.01, -0.01, 0.01),
    position = new THREE.Vector3(0, 0, 0),
    center = true,
    onProgress 
  } = options;

  return new Promise((resolve, reject) => {
    const svgGroup = new THREE.Group();
    svgGroup.scale.copy(scale);
    scene.add(svgGroup);

    const loader = new SVGLoader();
    loader.load(
      url,
      (data) => {
        const paths = data.paths;

        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];

          const material = new THREE.MeshBasicMaterial({
            color: path.color,
            side: THREE.DoubleSide,
          });

          const shapes = SVGLoader.createShapes(path);

          for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            const geometry = new THREE.ShapeGeometry(shape);
            const mesh = new THREE.Mesh(geometry, material);
            svgGroup.add(mesh);
          }
        }

        if (center) {
          const box = new THREE.Box3().setFromObject(svgGroup);
          const boxCenter = box.getCenter(new THREE.Vector3());
          svgGroup.position.sub(boxCenter);
        }
        
        // Apply the position after centering
        svgGroup.position.add(position);
        
        resolve(svgGroup);
      },
      onProgress,
      (error) => {
        console.error('An error occurred loading the SVG:', error);
        reject(error);
      }
    );
  });
}

export function loadText(options: TextLoaderOptions): Promise<THREE.Mesh> {
  const {
    url,
    scene,
    text,
    size = 0.5,
    depth = 0.1,
    position = new THREE.Vector3(0, -2, 0),
    scale = new THREE.Vector3(3, 3, 3),
    color = "white",
    onProgress
  } = options;

  return new Promise((resolve, reject) => {
    const fontLoader = new FontLoader();
    fontLoader.load(
      url,
      (font) => {
        const geometry = new TextGeometry(text, {
          font: font,
          size: size,
          depth: depth,
          curveSegments: 12,
          bevelEnabled: false,
        });
        
        const material = new THREE.MeshBasicMaterial({ color: color });
        const textMesh = new THREE.Mesh(geometry, material);
        
        geometry.center();
        
        textMesh.position.copy(position);
        textMesh.scale.copy(scale);
        
        scene.add(textMesh);
        resolve(textMesh);
      }, 
      onProgress,
      (error) => {
        console.error('An error occurred loading the font:', error);
        reject(error);
      }
    );
  });
}