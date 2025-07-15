import Shape from "./Shape.js";
/**
 * A series of connected line segments.
 *
 * @example polyline.ts
 */
export default class Polyline extends Shape {
    constructor(points, config = {}) {
        super(points, { ...Polyline.defaultConfig(), ...config, fillOpacity: 0 });
        this.curveEndIndices = [[0, 1]];
    }
    reshape(points, config = {}) {
        const newConfig = { ...this.getStyle(), ...config };
        this.stroke.geometry.setPoints(points, false);
        this.restyle(newConfig);
    }
    static defaultConfig() {
        return { ...Shape.defaultConfig(), fill: false };
    }
    getClassConfig() {
        return {};
    }
    getAttributes() {
        return {
            points: this.points,
        };
    }
    static fromAttributes(attributes) {
        const { points } = attributes;
        return new Polyline(points);
    }
}
//# sourceMappingURL=Polyline.js.map