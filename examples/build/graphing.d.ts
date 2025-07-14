import { Polyline } from './geometry';
import type { Style } from './geometry.types';
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
