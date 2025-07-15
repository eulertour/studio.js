import { Animation } from "./index.js";
import * as THREE from "three";
export default class SetStyle extends Animation {
    constructor(shape, style, config) {
        super((elapsedTime) => {
            if (this.initialStyle.fillColor !== undefined &&
                this.targetStyle.fillColor !== undefined) {
                const t = Math.min(Math.max(elapsedTime, 0), 1);
                this.currentStyle.fillColor = new THREE.Color()
                    .copy(this.initialStyle.fillColor)
                    .lerp(this.targetStyle.fillColor, t);
            }
            if (this.initialStyle.strokeColor !== undefined &&
                this.targetStyle.strokeColor !== undefined) {
                const t = Math.min(Math.max(elapsedTime, 0), 1);
                this.currentStyle.strokeColor = new THREE.Color().copy(this.initialStyle.strokeColor);
                this.currentStyle.strokeColor.lerp(this.targetStyle.strokeColor, t);
            }
            if (this.initialStyle.fillOpacity !== undefined &&
                this.targetStyle.fillOpacity !== undefined) {
                this.currentStyle.fillOpacity = THREE.MathUtils.lerp(this.initialStyle.fillOpacity, this.targetStyle.fillOpacity, elapsedTime);
            }
            if (this.initialStyle.strokeOpacity !== undefined &&
                this.targetStyle.strokeOpacity !== undefined) {
                this.currentStyle.strokeOpacity = THREE.MathUtils.lerp(this.initialStyle.strokeOpacity, this.targetStyle.strokeOpacity, elapsedTime);
            }
            if (this.initialStyle.strokeWidth !== undefined &&
                this.targetStyle.strokeWidth !== undefined) {
                this.currentStyle.strokeWidth = THREE.MathUtils.lerp(this.initialStyle.strokeWidth, this.targetStyle.strokeWidth, elapsedTime);
            }
            shape.restyle(this.currentStyle);
        }, { object: shape, ...config });
        Object.defineProperty(this, "shape", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: shape
        });
        Object.defineProperty(this, "style", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: style
        });
        Object.defineProperty(this, "initialStyle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "targetStyle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentStyle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    setUp() {
        super.setUp();
        const shapeStyle = this.shape.getStyle();
        this.initialStyle = {
            ...shapeStyle,
            fillColor: shapeStyle.fillColor ? new THREE.Color().copy(shapeStyle.fillColor) : undefined,
            strokeColor: shapeStyle.strokeColor ? new THREE.Color().copy(shapeStyle.strokeColor) : undefined
        };
        this.targetStyle = {
            ...this.style,
            fillColor: this.style.fillColor ? new THREE.Color().copy(this.style.fillColor) : undefined,
            strokeColor: this.style.strokeColor ? new THREE.Color().copy(this.style.strokeColor) : undefined
        };
    }
}
//# sourceMappingURL=SetStyle.js.map