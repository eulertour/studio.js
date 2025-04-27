import * as THREE from "three/webgpu";

export type Transform = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

export type StrokeProportionConfig =
  | number
  | (
      | { start: number }
      | { end: number }
      | {
          start: number;
          end: number;
        }
    );

export type StrokeArrowConfig =
  | boolean
  | {
      width?: number;
      length?: number;
      draw?: boolean;
    };

export type Style = {
  fillColor?: THREE.Color;
  fillOpacity?: number;
  strokeColor?: THREE.Color;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDash?: boolean;
  strokeDashLength?: number;
  strokeDashSpeed?: number;
  strokeDashOffset?: number;
  strokeProportion?: StrokeProportionConfig;
  strokeArrow?: StrokeArrowConfig;
};

type StyleData = {
  fillColor?: THREE.Color;
  fillOpacity?: number;
  strokeColor?: THREE.Color;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDashLength?: number;
  strokeDashSpeed?: number;
  strokeDashOffset?: number;
  strokeStartProportion?: number;
  strokeEndProportion?: number;
  strokeArrow?: boolean;
  strokeDrawArrow?: boolean;
  strokeArrowWidth?: number;
  strokeArrowLength?: number;
};

export const strokeProportionConfigToData = (
  strokeProportionConfig: StrokeProportionConfig,
): { strokeStartProportion: number; strokeEndProportion: number } => {
  if (typeof strokeProportionConfig === "number") {
    return {
      strokeStartProportion: 0,
      strokeEndProportion: strokeProportionConfig,
    };
  } else if (
    "start" in strokeProportionConfig &&
    !("end" in strokeProportionConfig)
  ) {
    return {
      strokeStartProportion: strokeProportionConfig.start,
      strokeEndProportion: 1,
    };
  } else if (
    "end" in strokeProportionConfig &&
    !("start" in strokeProportionConfig)
  ) {
    return {
      strokeStartProportion: 0,
      strokeEndProportion: strokeProportionConfig.end,
    };
  } else {
    if (strokeProportionConfig.end < strokeProportionConfig.start) {
      throw new Error("start proportion cannot be greater than end proportion");
    } else if (
      strokeProportionConfig.start < 0 ||
      strokeProportionConfig.end > 1
    ) {
      throw new Error("stroke proportions must be between 0 and 1");
    }
    return {
      strokeStartProportion: strokeProportionConfig.start,
      strokeEndProportion: strokeProportionConfig.end,
    };
  }
};

const strokeArrowConfigToData = (
  strokeArrowConfig: StrokeArrowConfig,
): {
  strokeArrow: boolean;
  strokeDrawArrow: boolean;
  strokeArrowWidth: number;
  strokeArrowLength: number;
} => {
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

export const styleToData = (style: Style): StyleData => {
  const data: StyleData = {};
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
  if (style.strokeDashLength !== undefined) {
    data.strokeDashLength = style.strokeDashLength;
  }
  if (style.strokeDashSpeed !== undefined) {
    data.strokeDashSpeed = style.strokeDashSpeed;
  }
  if (style.strokeDashOffset !== undefined) {
    data.strokeDashOffset = style.strokeDashOffset;
  }
  if (style.strokeProportion !== undefined) {
    const { strokeStartProportion, strokeEndProportion } =
      strokeProportionConfigToData(style.strokeProportion);
    data.strokeStartProportion = strokeStartProportion;
    data.strokeEndProportion = strokeEndProportion;
  }
  if (style.strokeArrow !== undefined) {
    const {
      strokeArrow,
      strokeDrawArrow,
      strokeArrowWidth,
      strokeArrowLength,
    } = strokeArrowConfigToData(style.strokeArrow);
    data.strokeArrow = strokeArrow;
    data.strokeDrawArrow = strokeDrawArrow;
    data.strokeArrowWidth = strokeArrowWidth;
    data.strokeArrowLength = strokeArrowLength;
  }
  return data;
};
