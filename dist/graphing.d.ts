import { Polyline, type Style } from "./geometry.js";
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