import * as THREE from "three/webgpu";
import VertexShader from "./shaders/Vertex.js";
import FragmentShader from "./shaders/Fragment.js";
import DashAtlas from "./DashAtlas.js";
export default class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
    constructor(uniforms, dashSpeed, dashPattern, threeDimensions) {
        super({
            transparent: true,
            side: threeDimensions ? THREE.FrontSide : THREE.DoubleSide,
        });
        Object.defineProperty(this, "dashAtlas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "uniforms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dashSpeed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "previousDashOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.dashSpeed = dashSpeed;
        this.dashAtlas = new DashAtlas(dashPattern);
        this.uniforms = uniforms;
        this.vertexNode = new VertexShader(this.uniforms.width, this.uniforms.firstPoint, this.uniforms.secondPoint, this.uniforms.arrowSegmentStart, this.uniforms.arrowSegmentEnd, this.uniforms.arrowSegmentProportion, this.uniforms.arrowWidth, this.uniforms.arrowLength, this.uniforms.viewport, this.uniforms.viewportSize, this.uniforms.viewportOffset, this.uniforms.devicePixelRatio).node();
        this.fragmentNode = new FragmentShader(this.dashAtlas, this.uniforms.color, this.uniforms.opacity, this.uniforms.width, this.uniforms.length, this.uniforms.dashLength, this.uniforms.dashOffset, this.uniforms.startProportion, this.uniforms.endProportion, this.uniforms.arrow, this.uniforms.drawArrow, this.uniforms.viewport, this.uniforms.viewportSize, this.uniforms.viewportOffset, this.uniforms.devicePixelRatio).node();
    }
    update(dt) {
        if (this.dashSpeed === 0) {
            return;
        }
        const currentCycleLength = this.dashAtlas.period.value * this.uniforms.dashLength.value;
        const offsetChange = dt * this.dashSpeed;
        let newOffset = (this.previousDashOffset + offsetChange) % currentCycleLength;
        this.uniforms.dashOffset.value = newOffset;
        this.previousDashOffset = newOffset;
    }
    dispose() {
        super.dispose();
        this.dashAtlas.atlas.dispose();
    }
}
//# sourceMappingURL=Material.js.map