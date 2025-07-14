import * as THREE from "three/webgpu";
import { StrokeProportionConfig, StrokeDashesConfig, StrokeArrowConfig } from "../utils.js";
export type Uniforms = {
    firstPoint: THREE.UniformNode<THREE.Vector3>;
    secondPoint: THREE.UniformNode<THREE.Vector3>;
    color: THREE.UniformNode<THREE.Color>;
    opacity: THREE.UniformNode<number>;
    width: THREE.UniformNode<number>;
    length: THREE.UniformNode<number>;
    dashLength: THREE.UniformNode<number>;
    dashOffset: THREE.UniformNode<number>;
    startProportion: THREE.UniformNode<number>;
    endProportion: THREE.UniformNode<number>;
    arrow: THREE.UniformNode<number>;
    arrowSegmentStart: THREE.UniformNode<THREE.Vector3>;
    arrowSegmentEnd: THREE.UniformNode<THREE.Vector3>;
    arrowSegmentProportion: THREE.UniformNode<number>;
    drawArrow: THREE.UniformNode<number>;
    arrowWidth: THREE.UniformNode<number>;
    arrowLength: THREE.UniformNode<number>;
    viewport: THREE.UniformNode<THREE.Vector4>;
    viewportSize: THREE.UniformNode<THREE.Vector2>;
    viewportOffset: THREE.UniformNode<THREE.Vector2>;
    devicePixelRatio: THREE.UniformNode<number>;
};
interface StrokeStyle {
    strokeColor?: THREE.Color;
    strokeOpacity?: number;
    strokeWidth?: number;
    strokeDashes?: StrokeDashesConfig;
    strokeProportion?: StrokeProportionConfig;
    strokeArrow?: StrokeArrowConfig;
}
interface Config {
    color?: THREE.Color;
    opacity?: number;
    width?: number;
    dashLength?: number;
    dashSpeed?: number;
    dashPattern?: Array<number>;
    dashOffset?: number;
    startProportion?: number;
    endProportion?: number;
    arrow?: boolean;
    drawArrow?: boolean;
    arrowWidth?: number;
    arrowLength?: number;
    threeDimensions?: boolean;
}
export default class WebGPUMeshLine extends THREE.Mesh {
    constructor(points: Array<THREE.Vector3>, inputConfig?: Config);
    get points(): any;
    restyle(style: StrokeStyle): void;
    update(dt: number): void;
}
export {};
//# sourceMappingURL=index.d.ts.map