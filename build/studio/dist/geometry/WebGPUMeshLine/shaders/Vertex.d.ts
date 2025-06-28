import { ShaderNodeFn } from "three/src/nodes/TSL.js";
import { UniformNode } from "three/webgpu";
import { Vector2, Vector3 } from "three/webgpu";
import * as THREE from "three/webgpu";
export default class VertexShader {
    node: ShaderNodeFn<[]>;
    constructor(width: UniformNode<number>, firstPosition: UniformNode<Vector3>, secondPosition: UniformNode<Vector3>, arrowSegmentStart: UniformNode<Vector3>, arrowSegmentEnd: UniformNode<Vector3>, arrowSegmentProportion: UniformNode<number>, arrowLength: UniformNode<number>, arrowWidth: UniformNode<number>, viewport: UniformNode<THREE.Vector4>, viewportSize: UniformNode<Vector2>, viewportOffset: UniformNode<Vector2>, devicePixelRatio: UniformNode<number>);
}
//# sourceMappingURL=Vertex.d.ts.map