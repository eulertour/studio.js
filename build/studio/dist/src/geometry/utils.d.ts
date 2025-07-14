import * as THREE from "three/webgpu";
export type Transform = {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
};
export type StrokeDashesConfig = boolean | {
    length?: number;
    speed?: number;
    offset?: number;
};
export type StrokeProportionConfig = number | ({
    start: number;
} | {
    end: number;
} | {
    start: number;
    end: number;
});
export type StrokeArrowConfig = boolean | {
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
    strokeDashes?: StrokeDashesConfig;
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
export declare const strokeDashesConfigToData: (strokeDashesConfig: StrokeDashesConfig) => {
    strokeDashLength: number;
    strokeDashSpeed: number;
    strokeDashOffset: number;
};
export declare const strokeProportionConfigToData: (strokeProportionConfig: StrokeProportionConfig) => {
    strokeStartProportion: number;
    strokeEndProportion: number;
};
export declare const styleToData: (style: Style) => StyleData;
export {};
//# sourceMappingURL=utils.d.ts.map