import Polyline from "./geometry/polyline.js";
import { type Style } from "./geometry/shape.js";
/**
 * A curve described by an equation.
 */
export declare class Curve extends Polyline {
    equation: () => void;
    constructor(equation: () => void, config?: Style);
    static defaultConfig(): {
        fill: boolean;
    };
    getClassConfig(): {};
}
//# sourceMappingURL=graphing.d.ts.map