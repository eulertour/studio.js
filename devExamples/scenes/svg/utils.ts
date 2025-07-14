import { THREE, SVGLoader } from "@eulertour/studio";

interface SVGLoaderOptions {
  content: string;
  center?: boolean;
}

export function loadSVG(options: SVGLoaderOptions): THREE.Group {
  const { 
    content,
    center = false,
  } = options;

  const svgGroup = new THREE.Group();

  const loader = new SVGLoader();
  const data = loader.parse(content);
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
  
  return svgGroup;
}