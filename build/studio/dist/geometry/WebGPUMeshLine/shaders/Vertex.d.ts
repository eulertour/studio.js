import { ShaderNodeFn } from "three/src/nodes/TSL.js";
import { UniformNode } from "three/webgpu";
import { Vector3 } from "three";
export default class VertexShader {
    node: ShaderNodeFn<[]>;
    constructor(width: UniformNode<number>, firstPosition: UniformNode<Vector3>, secondPosition: UniformNode<Vector3>, arrowSegmentStart: UniformNode<Vector3>, arrowSegmentEnd: UniformNode<Vector3>, arrowSegmentProportion: UniformNode<number>, arrowLength: UniformNode<number>, arrowWidth: UniformNode<number>);
}
//# sourceMappingURL=Vertex.d.ts.map