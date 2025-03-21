import Rectangle from "./Rectangle.js";
import { Animation } from "../animation/Animation.js";
import { MathUtils } from "three";
/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
export default class Square extends Rectangle {
    constructor(sideLength = 2, config = {}) {
        super(sideLength, sideLength, { ...Square.defaultConfig(), ...config });
        Object.defineProperty(this, "sideLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: sideLength
        });
    }
    reshape(sideLength, config = {}) {
        this.sideLength = sideLength;
        this.copyStrokeAndFill(new Square(sideLength, config));
    }
    Reshape(sideLength, config = {}) {
        let startSideLength;
        let endSideLength;
        return new Animation((t, dt) => {
            this.reshape(MathUtils.lerp(startSideLength, endSideLength, t));
        }, {
            before: () => {
                startSideLength = this.sideLength;
                endSideLength = sideLength;
            },
        });
    }
    getCloneAttributes() {
        return [this.sideLength];
    }
    getAttributes() {
        return {
            width: this.sideLength,
            height: this.sideLength,
        };
    }
    static fromAttributes(attributes) {
        const { width } = attributes;
        return new Square(width);
    }
    get attributeData() {
        return [
            {
                attribute: "sideLength",
                type: "number",
                default: 2,
            },
        ];
    }
}
//# sourceMappingURL=Square.js.map