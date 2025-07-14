import { ShaderNodeObject } from "three/tsl";
import * as THREE from "three/webgpu";
import OperatorNode from "three/src/nodes/math/OperatorNode.js";
import { ShaderNodeFn } from "three/src/nodes/TSL.js";
import { UniformNode } from "three/webgpu";
import { Vector2 } from "three/webgpu";
import DashAtlas from "../DashAtlas.js";
export default class FragmentShader {
    dashAtlas: DashAtlas;
    node: ShaderNodeFn<[]>;
    constructor(dashAtlas: DashAtlas, color: UniformNode<THREE.Color>, opacity: UniformNode<number>, width: UniformNode<number>, strokeEnd: UniformNode<number>, dashLength: UniformNode<number>, dashOffset: UniformNode<number>, startProportion: UniformNode<number>, endProportion: UniformNode<number>, arrow: UniformNode<number>, drawArrow: UniformNode<number>, viewport: UniformNode<THREE.Vector4>, viewportSize: UniformNode<Vector2>, viewportOffset: UniformNode<Vector2>, devicePixelRatio: UniformNode<number>);
    getReferenceDashData: THREE.TSL.ShaderNodeFn<[THREE.TSL.NodeRepresentation<ShaderNodeObject<OperatorNode>>, THREE.TSL.NodeRepresentation<ShaderNodeObject<OperatorNode>>, THREE.TSL.NodeRepresentation<ShaderNodeObject<OperatorNode>>]>;
}
//# sourceMappingURL=Fragment.d.ts.map