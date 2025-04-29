import Shape from "./Shape.js";
import { type Style } from "./utils.js";
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
    constructor(inputPoints: Array<THREE.Vector3>, config?: Style);
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polygon;
    get attributeData(): never[];
}
//# sourceMappingURL=Polygon.d.ts.map