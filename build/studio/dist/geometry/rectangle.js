import * as THREE from "three/webgpu";
import Shape from "./Shape.js";
/**
 * A shape with four sides and four right angles.
 *
 * @example rectangle.ts
 */
export default class Rectangle extends Shape {
    constructor(width = 4, height = 2, config = {}) {
        super([
            new THREE.Vector3(-width / 2, height / 2, 0),
            new THREE.Vector3(width / 2, height / 2, 0),
            new THREE.Vector3(width / 2, -height / 2, 0),
            new THREE.Vector3(-width / 2, -height / 2, 0),
            new THREE.Vector3(-width / 2, height / 2, 0),
        ], { ...Rectangle.defaultConfig(), ...config });
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: width
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: height
        });
    }
    getCloneAttributes() {
        return [this.width, this.height];
    }
    getAttributes() {
        return {
            width: this.width,
            height: this.height,
        };
    }
    static fromAttributes(attributes) {
        const { width, height } = attributes;
        return new Rectangle(width, height);
    }
    get attributeData() {
        return [
            {
                attribute: "width",
                type: "number",
                default: 4,
            },
            {
                attribute: "height",
                type: "number",
                default: 2,
            },
        ];
    }
    getCurveEndIndices() {
        return [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
        ];
    }
}
//# sourceMappingURL=Rectangle.js.map