import { Style } from "./shape.js";
import { THREE } from "./index.js";
import Shape from "./shape.js";
import { PolygonAttributes } from "./polygon.js";
/**
 * A series of connected line segments.
 *
 * @example polyline.ts
 */
export default class Polyline extends Shape {
    constructor(points: Array<THREE.Vector3>, config?: Style);
    reshape(points: Array<THREE.Vector3>, config?: Style): void;
    static defaultConfig(): {
        fill: boolean;
    };
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polyline;
}
//# sourceMappingURL=polyline.d.ts.map