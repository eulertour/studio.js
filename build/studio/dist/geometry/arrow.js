import Shape from "./shape.js";
/**
 * An arrow.
 *
 * @example arrow.ts
 */
export default class Arrow extends Shape {
    constructor(start, end, config = {}) {
        super([start, end], { ...Arrow.defaultConfig(), ...config, arrow: true });
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
    getAttributes() {
        return {
            start: this.start,
            end: this.end,
        };
    }
}
//# sourceMappingURL=arrow.js.map