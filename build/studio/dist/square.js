import Rectangle from "./rectangle.js";
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
        this.copyStrokeFill(new Square(sideLength, config));
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
//# sourceMappingURL=square.js.map