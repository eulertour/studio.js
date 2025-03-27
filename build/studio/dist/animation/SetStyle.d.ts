import { Animation } from "./index.js";
import { Shape, Style } from "../geometry/index.js";
export default class SetStyle extends Animation {
    shape: Shape;
    style: Style;
    private initialStyle;
    private targetStyle;
    private currentStyle;
    constructor(shape: Shape, style: Style, config?: any);
    setUp(): void;
}
//# sourceMappingURL=SetStyle.d.ts.map