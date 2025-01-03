import * as THREE from "three";
import * as Geometry from "./geometry.js";
declare const BUFFER = 0.5;
declare const ORIGIN: Readonly<THREE.Vector3>;
declare const RIGHT: Readonly<THREE.Vector3>;
declare const LEFT: Readonly<THREE.Vector3>;
declare const UP: Readonly<THREE.Vector3>;
declare const DOWN: Readonly<THREE.Vector3>;
declare const OUT: Readonly<THREE.Vector3>;
declare const IN: Readonly<THREE.Vector3>;
declare const clamp: (num: any, min: any, max: any) => number;
declare const getFrameAttributes: (aspectRatio: number, height: number) => {
    aspectRatio: number;
    height: number;
    width: number;
    coordinateHeight: number;
    coordinateWidth: number;
};
export type WidthSetupConfig = {
    aspectRatio: number;
    pixelWidth: number;
    coordinateWidth: number;
};
export type HeightSetupConfig = {
    aspectRatio: number;
    pixelHeight: number;
    coordinateHeight: number;
};
declare const setupCanvas: (canvas: HTMLCanvasElement, config?: (WidthSetupConfig | HeightSetupConfig) & {
    viewport?: THREE.Vector4;
}) => [THREE.Scene, THREE.Camera, THREE.WebGLRenderer];
declare const convertWorldDirectionToObjectSpace: (worldDirection: THREE.Vector3, object: THREE.Object3D) => THREE.Vector3;
declare const vstack: (group: THREE.Group, buffer?: number) => THREE.Group<THREE.Object3DEventMap> | undefined;
declare const vspace: (group: THREE.Group, distanceBetween?: number) => THREE.Group<THREE.Object3DEventMap> | undefined;
declare const transformBetweenSpaces: (from: THREE.Object3D, to: THREE.Object3D, point: THREE.Vector3) => THREE.Vector3;
declare const furthestInDirection: (object: any, direction: any, exclude?: THREE.Object3D | Array<THREE.Object3D>) => any;
declare const moveNextTo: (target: THREE.Object3D, object: THREE.Object3D, direction: THREE.Vector3, buffer?: number) => THREE.Object3D<THREE.Object3DEventMap>;
declare const moveToRightOf: (target: any, object: any, distance?: number) => THREE.Object3D<THREE.Object3DEventMap>;
declare const moveToLeftOf: (target: any, object: any, distance?: number) => THREE.Object3D<THREE.Object3DEventMap>;
declare const moveAbove: (target: any, object: any, distance?: number) => THREE.Object3D<THREE.Object3DEventMap>;
declare const moveBelow: (target: any, object: any, distance?: number) => THREE.Object3D<THREE.Object3DEventMap>;
declare const rotate90: (v: THREE.Vector3) => THREE.Vector3;
declare const rotate180: (v: THREE.Vector3) => THREE.Vector3;
declare const rotate270: (v: THREE.Vector3) => THREE.Vector3;
declare const getBoundingBoxCenter: (obj: THREE.Object3D, target: THREE.Vector3) => THREE.Vector3;
declare const getBoundingBoxHelper: (obj: THREE.Object3D, color: string) => THREE.Box3Helper;
declare const pointAlongCurve: (shape: Geometry.Shape, t: number) => THREE.Vector3 | undefined;
declare const intersectionsBetween: (shape1: Geometry.Shape, shape2: Geometry.Shape) => Array<THREE.Vector3>;
declare const positiveAngleTo: (a: THREE.Vector3, b: THREE.Vector3) => number;
declare class ShapeFromCurves {
    adjacentThreshold: number;
    segmentClosestToPoint: THREE.Vector3;
    pointToSegment: THREE.Vector3;
    points: Array<THREE.Vector3>;
    style: Geometry.Style;
    withStyle(style: Geometry.Style): this;
    startAt(start: THREE.Vector3): this;
    extendAlong(shape: Geometry.Shape, direction: THREE.Vector3, until?: THREE.Vector3 | undefined): this;
    extendCurve(shape: Geometry.Shape, initialPointIndex: number, forward: boolean, until?: THREE.Vector3 | undefined): void;
    finish(): Geometry.Polygon;
}
export { getFrameAttributes, setupCanvas, clamp, vstack, vspace, furthestInDirection, moveToRightOf, moveToLeftOf, moveAbove, moveBelow, moveNextTo, rotate90, rotate180, rotate270, getBoundingBoxCenter, getBoundingBoxHelper, transformBetweenSpaces, convertWorldDirectionToObjectSpace, intersectionsBetween, pointAlongCurve, positiveAngleTo, ShapeFromCurves, BUFFER, RIGHT, LEFT, UP, DOWN, OUT, IN, ORIGIN, };
//# sourceMappingURL=utils.d.ts.map