import Shape from "./shape.js";
/**
 * A shape made up of line segments connected
 * to form a (usually) closed shape.
 *
 * @example polygon.ts
 */
export default class Polygon extends Shape {
    constructor(points, config = {}) {
        super(points, { ...Polygon.defaultConfig(), ...config });
        this.curveEndIndices = [];
        for (let i = 0; i < points.length - 1; i++) {
            this.curveEndIndices.push([i, i + 1]);
        }
    }
    getClassConfig() {
        return {};
    }
    getAttributes() {
        return { points: this.points };
    }
    static fromAttributes(attributes) {
        const { points } = attributes;
        return new Polygon(points);
    }
    get attributeData() {
        return [];
    }
}
//# sourceMappingURL=polygon.js.map