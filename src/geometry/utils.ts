import * as THREE from "three/webgpu";

export type Transform = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

type StrokeProportionConfig =
  | number
  | (
      | { start: number }
      | { end: number }
      | {
          start: number;
          end: number;
        }
    );

export type Style = {
  fillColor?: THREE.Color;
  fillOpacity?: number;
  strokeColor?: THREE.Color;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDashLength?: number;
  strokeDashSpeed?: number;
  strokeDashOffset?: number;
  strokeProportion?: StrokeProportionConfig;
  dashed?: boolean;
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
  return data;
};
