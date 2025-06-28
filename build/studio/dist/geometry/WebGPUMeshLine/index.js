import * as THREE from "three/webgpu";
import WebGPUMeshLineGeometry from "./Geometry.js";
import WebGPUMeshLineMaterial from "./Material.js";
import { strokeProportionConfigToData, strokeDashesConfigToData, } from "../utils.js";
import { uniform } from "three/tsl";
import { ViewportManager } from "../../ViewportManager.js";
const defaultConfig = {
    color: new THREE.Color(0x000000),
    opacity: 1,
    width: 1,
    dashLength: 1,
    dashSpeed: 1,
    dashPattern: [1, 1],
    dashOffset: 0,
    startProportion: 0,
    endProportion: 1,
    arrow: false,
    drawArrow: false,
    arrowWidth: 1,
    arrowLength: 1,
    threeDimensions: true,
};
const createUniforms = (geometry, color, opacity, width, dashLength, dashOffset, startProportion, endProportion, arrow, drawArrow, arrowWidth, arrowLength) => {
    const viewportManager = ViewportManager.getInstance();
    const uniforms = {
        firstPoint: uniform(new THREE.Vector3()),
        secondPoint: uniform(new THREE.Vector3()),
        color: uniform(color),
        opacity: uniform(opacity),
        width: uniform(width),
        length: uniform(geometry.strokeLength),
        dashLength: uniform(dashLength),
        dashOffset: uniform(dashOffset),
        startProportion: uniform(startProportion),
        endProportion: uniform(endProportion),
        arrow: uniform(arrow ? 1 : 0),
        drawArrow: uniform(drawArrow ? 1 : 0),
        arrowWidth: uniform(arrowWidth),
        arrowLength: uniform(arrowLength),
        arrowSegmentStart: uniform(new THREE.Vector3()),
        arrowSegmentEnd: uniform(new THREE.Vector3()),
        arrowSegmentProportion: uniform(0),
        viewport: uniform(viewportManager.viewport || new THREE.Vector4(0, 0, 0, 0)),
        viewportSize: uniform(viewportManager.viewportSize),
        viewportOffset: uniform(viewportManager.viewportOffset),
        devicePixelRatio: uniform(viewportManager.devicePixelRatio),
    };
    // TODO: Update this after finishing arrow geometry
    geometry.getPoint(0, uniforms.firstPoint.value);
    geometry.getPoint(1, uniforms.secondPoint.value);
    if (arrow) {
        geometry.fillArrowSegmentData(endProportion, uniforms);
    }
    return uniforms;
};
export default class WebGPUMeshLine extends THREE.Mesh {
    constructor(points, inputConfig = {}) {
        const config = { ...defaultConfig, ...inputConfig };
        const geometry = new WebGPUMeshLineGeometry(points);
        const uniforms = createUniforms(geometry, config.color, config.opacity, config.width, config.dashLength, config.dashOffset, config.startProportion, config.endProportion, config.arrow, config.drawArrow, config.arrowWidth, config.arrowLength);
        const material = new WebGPUMeshLineMaterial(uniforms, config.dashSpeed, config.dashPattern, config.threeDimensions);
        super(geometry, material);
    }
    restyle(style) {
        const { strokeColor, strokeOpacity, strokeWidth, strokeDashes, strokeArrow, strokeProportion, } = style;
        const setUniform = (uniform, value) => {
            if (Array.isArray(this.material)) {
                this.material.forEach((material) => {
                    if (material.uniforms &&
                        material.uniforms[uniform]) {
                        material.uniforms[uniform].value =
                            value;
                    }
                });
            }
            else {
                if (this.material.uniforms &&
                    this.material.uniforms[uniform]) {
                    this.material.uniforms[uniform].value =
                        value;
                }
            }
        };
        if (strokeColor !== undefined) {
            setUniform("color", strokeColor);
        }
        if (strokeOpacity !== undefined) {
            setUniform("opacity", strokeOpacity);
        }
        if (strokeWidth !== undefined) {
            setUniform("width", strokeWidth);
        }
        if (strokeDashes !== undefined) {
            if (strokeDashes.length !== undefined) {
                const { strokeDashLength } = strokeDashesConfigToData({
                    length: style.strokeDashes.length,
                });
                setUniform("dashLength", strokeDashLength);
            }
            if (strokeDashes.speed !== undefined) {
                const { strokeDashSpeed } = strokeDashesConfigToData({
                    speed: style.strokeDashes.speed,
                });
                this.material.dashSpeed = strokeDashSpeed;
            }
            if (strokeDashes.offset !== undefined) {
                const { strokeDashOffset } = strokeDashesConfigToData({
                    offset: style.strokeDashes.offset,
                });
                setUniform("dashOffset", strokeDashOffset);
            }
        }
        if (strokeProportion !== undefined) {
            const { strokeStartProportion, strokeEndProportion } = strokeProportionConfigToData(strokeProportion);
            setUniform("startProportion", strokeStartProportion);
            setUniform("endProportion", strokeEndProportion);
            if (this.geometry instanceof WebGPUMeshLineGeometry) {
                this.geometry.fillArrowSegmentData(strokeEndProportion, this.material.uniforms);
            }
        }
    }
    update(dt) {
        // Update material's dash animation
        if (this.material instanceof WebGPUMeshLineMaterial) {
            this.material.update(dt);
        }
        else if (Array.isArray(this.material)) {
            this.material.forEach((material) => {
                if (material instanceof WebGPUMeshLineMaterial) {
                    material.update(dt);
                }
            });
        }
        // Update viewport uniforms from singleton
        const viewportManager = ViewportManager.getInstance();
        const setUniform = (uniform, value) => {
            if (Array.isArray(this.material)) {
                this.material.forEach((material) => {
                    if (material.uniforms &&
                        material.uniforms[uniform]) {
                        material.uniforms[uniform].value =
                            value;
                    }
                });
            }
            else {
                if (this.material.uniforms &&
                    this.material.uniforms[uniform]) {
                    this.material.uniforms[uniform].value =
                        value;
                }
            }
        };
        setUniform("viewport", viewportManager.viewport || new THREE.Vector4(0, 0, 0, 0));
        setUniform("viewportSize", viewportManager.viewportSize);
        setUniform("viewportOffset", viewportManager.viewportOffset);
        setUniform("devicePixelRatio", viewportManager.devicePixelRatio);
    }
}
//# sourceMappingURL=index.js.map