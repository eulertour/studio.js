import { THREE, SVGLoader, TextGeometry, FontLoader } from "@eulertour/studio";
export function loadSVG(options) {
    const { content, center = false, } = options;
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
export function loadText(options) {
    const { fontData, text, size = 0.5, depth = 0.1, color = "white" } = options;
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
export const createRightEdgeFadeAlphaMap = (width, height, fadePercentage = 0.3) => {
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
};
//# sourceMappingURL=utils.js.map