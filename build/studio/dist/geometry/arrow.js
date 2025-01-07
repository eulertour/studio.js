import Line from "./line.js";
/**
 * An arrow derived from a line.
 *
 * @example arrow.ts
 */
export default class Arrow extends Line {
    constructor(start, end, config = {}) {
        super(start, end, { ...Arrow.defaultConfig(), ...config, arrow: true });
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: start
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: end
        });
    }
    reshape(start, end, config = {}) {
        this.start.copy(start);
        this.end.copy(end);
        this.copyStrokeFill(new Arrow(start, end, config));
    }
}
//# sourceMappingURL=arrow.js.map