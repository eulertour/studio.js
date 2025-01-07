import Arc, { ArcAttributes } from "./arc.js";
import { Style } from "./shape.js";
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
export default class Circle extends Arc {
    constructor(radius?: number, config?: Style & {
        fill?: boolean;
    });
    reshape(radius: number, config?: {}): void;
    static defaultConfig(): {
        fill: boolean;
        closed: boolean;
    };
    getCloneAttributes(): number[];
    getAttributes(): ArcAttributes;
    static fromAttributes(attributes: ArcAttributes): Circle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}
//# sourceMappingURL=circle.d.ts.map