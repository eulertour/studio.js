import { THREE, TextGeometry, FontLoader } from "@eulertour/studio";

interface TextLoaderOptions {
  fontData: string;
  text: string;
  size?: number;
  depth?: number;
  color?: string | number;
}

export function loadText(options: TextLoaderOptions): THREE.Mesh {
  const {
    fontData,
    text,
    size = 0.5,
    depth = 0.1,
    color = "white"
  } = options;

  const fontLoader = new FontLoader();
  const font = fontLoader.parse(JSON.parse(fontData));
  
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
  
  return textMesh;
}