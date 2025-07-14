import Shape from "./Shape.js";
import { Style } from "./utils.js";
import { THREE } from "../index.js";
import { PolygonAttributes } from "./Polygon.js";
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
//# sourceMappingURL=Polyline.d.ts.map