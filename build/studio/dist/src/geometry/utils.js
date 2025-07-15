export const strokeDashesConfigToData = (strokeDashesConfig) => {
    if (typeof strokeDashesConfig === "boolean") {
        return {
            strokeDashLength: 1,
            strokeDashSpeed: 0,
            strokeDashOffset: 0,
        };
    }
    else {
        const { length, speed, offset } = strokeDashesConfig;
        return {
            strokeDashLength: length ?? 1,
            strokeDashSpeed: speed ?? 0,
            strokeDashOffset: offset ?? 0,
        };
    }
};
export const strokeProportionConfigToData = (strokeProportionConfig) => {
    if (typeof strokeProportionConfig === "number") {
        return {
            strokeStartProportion: 0,
            strokeEndProportion: strokeProportionConfig,
        };
    }
    else if ("start" in strokeProportionConfig &&
        !("end" in strokeProportionConfig)) {
        return {
            strokeStartProportion: strokeProportionConfig.start,
            strokeEndProportion: 1,
        };
    }
    else if ("end" in strokeProportionConfig &&
        !("start" in strokeProportionConfig)) {
        return {
            strokeStartProportion: 0,
            strokeEndProportion: strokeProportionConfig.end,
        };
    }
    else {
        if (strokeProportionConfig.end < strokeProportionConfig.start) {
            throw new Error("start proportion cannot be greater than end proportion");
        }
        else if (strokeProportionConfig.start < 0 ||
            strokeProportionConfig.end > 1) {
            throw new Error("stroke proportions must be between 0 and 1");
        }
        return {
            strokeStartProportion: strokeProportionConfig.start,
            strokeEndProportion: strokeProportionConfig.end,
        };
    }
};
const strokeArrowConfigToData = (strokeArrowConfig) => {
    if (typeof strokeArrowConfig === "boolean") {
        return {
            strokeArrow: strokeArrowConfig,
            strokeDrawArrow: true,
            strokeArrowWidth: 0.35,
            strokeArrowLength: 0.35,
        };
    }
    const { width, length, draw } = strokeArrowConfig;
    return {
        strokeArrow: true,
        strokeDrawArrow: draw ?? true,
        strokeArrowWidth: width ?? 0.35,
        strokeArrowLength: length ?? 0.35,
    };
};
export const styleToData = (style) => {
    const data = {};
    if (style.fillColor !== undefined) {
        data.fillColor = style.fillColor;
    }
    if (style.fillOpacity !== undefined) {
        data.fillOpacity = style.fillOpacity;
    }
    if (style.strokeColor !== undefined) {
        data.strokeColor = style.strokeColor;
    }
    if (style.strokeOpacity !== undefined) {
        data.strokeOpacity = style.strokeOpacity;
    }
    if (style.strokeWidth !== undefined) {
        data.strokeWidth = style.strokeWidth;
    }
    if (style.strokeDashes !== undefined) {
        const { strokeDashLength, strokeDashSpeed, strokeDashOffset } = strokeDashesConfigToData(style.strokeDashes);
        data.strokeDashLength = strokeDashLength;
        data.strokeDashSpeed = strokeDashSpeed;
        data.strokeDashOffset = strokeDashOffset;
    }
    if (style.strokeProportion !== undefined) {
        const { strokeStartProportion, strokeEndProportion } = strokeProportionConfigToData(style.strokeProportion);
        data.strokeStartProportion = strokeStartProportion;
        data.strokeEndProportion = strokeEndProportion;
    }
    if (style.strokeArrow !== undefined) {
        const { strokeArrow, strokeDrawArrow, strokeArrowWidth, strokeArrowLength, } = strokeArrowConfigToData(style.strokeArrow);
        data.strokeArrow = strokeArrow;
        data.strokeDrawArrow = strokeDrawArrow;
        data.strokeArrowWidth = strokeArrowWidth;
        data.strokeArrowLength = strokeArrowLength;
    }
    return data;
};
//# sourceMappingURL=utils.js.map