import Shape, { Style } from "./shape.js";
import { THREE } from "../index.js";
export type PolygonAttributes = {
    points: Array<THREE.Vector3>;
};
/**
 * A shape made up of line segments connected
 * to form a (usually) closed shape.
 *
 * @example polygon.ts
 */
export default class Polygon extends Shape {
    constructor(points: Array<THREE.Vector3>, config?: Style);
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polygon;
    get attributeData(): never[];
}
//# sourceMappingURL=polygon.d.ts.map