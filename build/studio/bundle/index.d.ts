import * as THREE from 'three/webgpu';
import { Scene as Scene$1 } from 'three/webgpu';
export { THREE };
import { ShaderNodeObject } from 'three/tsl';

type Transform = {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
};
type StrokeDashesConfig = boolean | {
    length?: number;
    speed?: number;
    offset?: number;
};
type StrokeProportionConfig = number | ({
    start: number;
} | {
    end: number;
} | {
    start: number;
    end: number;
});
type StrokeArrowConfig = boolean | {
    width?: number;
    length?: number;
    draw?: boolean;
};
type Style = {
    fillColor?: THREE.Color;
    fillOpacity?: number;
    strokeColor?: THREE.Color;
    strokeOpacity?: number;
    strokeWidth?: number;
    strokeDashes?: StrokeDashesConfig;
    strokeProportion?: StrokeProportionConfig;
    strokeArrow?: StrokeArrowConfig;
};

type Uniforms = {
    firstPoint: THREE.UniformNode<THREE.Vector3>;
    secondPoint: THREE.UniformNode<THREE.Vector3>;
    color: THREE.UniformNode<THREE.Color>;
    opacity: THREE.UniformNode<number>;
    width: THREE.UniformNode<number>;
    length: THREE.UniformNode<number>;
    dashLength: THREE.UniformNode<number>;
    dashOffset: THREE.UniformNode<number>;
    startProportion: THREE.UniformNode<number>;
    endProportion: THREE.UniformNode<number>;
    arrow: THREE.UniformNode<number>;
    arrowSegmentStart: THREE.UniformNode<THREE.Vector3>;
    arrowSegmentEnd: THREE.UniformNode<THREE.Vector3>;
    arrowSegmentProportion: THREE.UniformNode<number>;
    drawArrow: THREE.UniformNode<number>;
    arrowWidth: THREE.UniformNode<number>;
    arrowLength: THREE.UniformNode<number>;
    viewport: THREE.UniformNode<THREE.Vector4>;
    viewportSize: THREE.UniformNode<THREE.Vector2>;
    viewportOffset: THREE.UniformNode<THREE.Vector2>;
    devicePixelRatio: THREE.UniformNode<number>;
};
interface StrokeStyle {
    strokeColor?: THREE.Color;
    strokeOpacity?: number;
    strokeWidth?: number;
    strokeDashes?: StrokeDashesConfig;
    strokeProportion?: StrokeProportionConfig;
    strokeArrow?: StrokeArrowConfig;
}
interface Config {
    color?: THREE.Color;
    opacity?: number;
    width?: number;
    dashLength?: number;
    dashSpeed?: number;
    dashPattern?: Array<number>;
    dashOffset?: number;
    startProportion?: number;
    endProportion?: number;
    arrow?: boolean;
    drawArrow?: boolean;
    arrowWidth?: number;
    arrowLength?: number;
    threeDimensions?: boolean;
}
declare class WebGPUMeshLine extends THREE.Mesh {
    constructor(points: Array<THREE.Vector3>, inputConfig?: Config);
    restyle(style: StrokeStyle): void;
    update(dt: number): void;
}

type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
type Stroke = WebGPUMeshLine;
/**
 * An abstract class representing a generalized shape.
 */
declare abstract class Shape extends THREE.Group {
    fill?: Fill;
    stroke?: Stroke;
    curveEndIndices: Array<Array<number>>;
    arrow: boolean;
    constructor(points: Array<THREE.Vector3>, userConfig?: Style & {
        arrow?: boolean;
        stroke?: boolean;
        fill?: boolean;
        closed?: boolean;
        fillPoints?: Array<THREE.Vector3>;
    });
    forwardEvent: (e: any) => void;
    add(...objects: THREE.Object3D[]): this;
    remove(...objects: THREE.Object3D[]): this;
    addLabel(tex: string, direction: THREE.Vector3): void;
    update(dt: number, _: number): void;
    static defaultStyleData(): {
        fillColor: THREE.Color;
        fillOpacity: number;
        strokeColor: THREE.Color;
        strokeOpacity: number;
        strokeWidth: number;
        strokeDashed: boolean;
        strokeDashLength: number;
        strokeDashSpeed: number;
        strokeDashOffset: number;
        strokeStartProportion: number;
        strokeEndProportion: number;
        strokeArrow: boolean;
        strokeDrawArrow: boolean;
        strokeArrowWidth: number;
        strokeArrowLength: number;
    };
    static defaultConfig(): {};
    reshape(...args: any[]): void;
    copyStroke(shape: Shape): void;
    copyFill(shape: Shape): void;
    copyStrokeAndFill(shape: Shape): void;
    get points(): Array<THREE.Vector3>;
    set points(newPoints: THREE.Vector3[]);
    worldPoint(index: number): THREE.Vector3;
    transformedPoint(index: number, targetSpace: THREE.Object3D): THREE.Vector3;
    segment(index: number): THREE.Line3;
    curve(curveIndex: number, worldTransform?: boolean): THREE.Vector3[];
    get numCurves(): number;
    getCurveEndIndices(): number[][];
    clear(): this;
    clone(recursive?: boolean): this;
    getClassConfig(): {};
    abstract getAttributes(): object;
    getCloneAttributes(): Array<unknown>;
    getStyle(): Style;
    restyle(style: Style, config?: {
        includeDescendents: boolean;
    }): void;
    copyStyle(shape: Shape): void;
    getTransform(): Transform;
    setTransform(transform: Transform): void;
    dispose(): this;
    getDimensions(): THREE.Vector2;
    closestPointToPoint(point: THREE.Vector3, target?: THREE.Vector3): THREE.Vector3;
}

type LineAttributes = {
    start: THREE.Vector3;
    end: THREE.Vector3;
};
/**
 * A segment between two points.
 *
 * @example line.ts
 */
declare class Line extends Shape {
    start: THREE.Vector3;
    end: THREE.Vector3;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
    static defaultConfig(): {};
    static centeredLine(start: THREE.Vector3, end: THREE.Vector3, config?: Style): Line;
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
    length(): number;
    getClassConfig(): {};
    getAttributes(): LineAttributes;
    getVector(global?: boolean): THREE.Vector3;
    static fromAttributes(attributes: LineAttributes): Line;
}

type ArrowAttributes = {
    start: THREE.Vector3;
    end: THREE.Vector3;
};
/**
 * An arrow.
 *
 * @example arrow.ts
 */
declare class Arrow extends Shape {
    start: THREE.Vector3;
    end: THREE.Vector3;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
    getAttributes(): ArrowAttributes;
}

type PolygonAttributes = {
    points: Array<THREE.Vector3>;
};
/**
 * A shape made up of line segments connected
 * to form a (usually) closed shape.
 *
 * @example polygon.ts
 */
declare class Polygon extends Shape {
    constructor(inputPoints: Array<THREE.Vector3>, config?: Style);
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polygon;
    get attributeData(): never[];
}

/**
 * A series of connected line segments.
 *
 * @example polyline.ts
 */
declare class Polyline extends Shape {
    constructor(points: Array<THREE.Vector3>, config?: Style);
    reshape(points: Array<THREE.Vector3>, config?: Style): void;
    static defaultConfig(): {
        fill: boolean;
    };
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polyline;
}

type ArcAttributes = {
    radius: number;
    angle: number;
    closed: boolean;
};
/**
 * An arc.
 *
 * @example arc.ts
 */
declare class Arc extends Shape {
    radius: number;
    angle: number;
    closed: boolean;
    constructor(radius?: number, angle?: number, config?: Style & {
        closed?: boolean;
    });
    reshape(radius?: number, angle?: number, config?: Style & {
        closed?: boolean;
    }): void;
    getCloneAttributes(): (number | boolean)[];
    getAttributes(): ArcAttributes;
    static fromAttributes(attributes: ArcAttributes): Arc;
    get attributeData(): ({
        attribute: string;
        type: string;
        default: number;
    } | {
        attribute: string;
        type: string;
        default: boolean;
    })[];
    getDimensions(): THREE.Vector2;
}

type CircleAttributes = {
    radius: number;
};
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
declare class Circle extends Shape {
    radius: number;
    constructor(radius?: number, config?: Style);
    reshape(radius: number, config?: {}): void;
    getCloneAttributes(): number[];
    getAttributes(): CircleAttributes;
    static fromAttributes(attributes: CircleAttributes): Circle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}

/**
 * A small circle representing a precise location in space.
 *
 * @example point.ts
 */
declare class Point extends Circle {
    constructor(position?: THREE.Vector2 | THREE.Vector3, config?: Style & {
        radius?: number;
    });
    static defaultConfig(): {
        radius: number;
    };
    getAttributes(): ArcAttributes;
    static fromAttributes(): Point;
}

type RectangleAttributes = {
    width: number;
    height: number;
};
/**
 * A shape with four sides and four right angles.
 *
 * @example rectangle.ts
 */
declare class Rectangle extends Shape {
    width: number;
    height: number;
    constructor(width?: number, height?: number, config?: Style);
    getCloneAttributes(): number[];
    getAttributes(): RectangleAttributes;
    static fromAttributes(attributes: RectangleAttributes): Rectangle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
    getCurveEndIndices(): Array<Array<number>>;
}

/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
declare class Square extends Rectangle {
    sideLength: number;
    constructor(sideLength?: number, config?: Style);
    reshape(sideLength: number, config?: {}): void;
    getCloneAttributes(): number[];
    getAttributes(): RectangleAttributes;
    static fromAttributes(attributes: RectangleAttributes): Square;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}

//# sourceMappingURL=index.d.ts.map

type index_d$1_Arc = Arc;
declare const index_d$1_Arc: typeof Arc;
type index_d$1_Arrow = Arrow;
declare const index_d$1_Arrow: typeof Arrow;
type index_d$1_Circle = Circle;
declare const index_d$1_Circle: typeof Circle;
type index_d$1_Line = Line;
declare const index_d$1_Line: typeof Line;
type index_d$1_Point = Point;
declare const index_d$1_Point: typeof Point;
type index_d$1_Polygon = Polygon;
declare const index_d$1_Polygon: typeof Polygon;
type index_d$1_Polyline = Polyline;
declare const index_d$1_Polyline: typeof Polyline;
type index_d$1_Rectangle = Rectangle;
declare const index_d$1_Rectangle: typeof Rectangle;
type index_d$1_Shape = Shape;
declare const index_d$1_Shape: typeof Shape;
type index_d$1_Square = Square;
declare const index_d$1_Square: typeof Square;
type index_d$1_Style = Style;
type index_d$1_Transform = Transform;
declare namespace index_d$1 {
  export { index_d$1_Arc as Arc, index_d$1_Arrow as Arrow, index_d$1_Circle as Circle, index_d$1_Line as Line, index_d$1_Point as Point, index_d$1_Polygon as Polygon, index_d$1_Polyline as Polyline, index_d$1_Rectangle as Rectangle, index_d$1_Shape as Shape, index_d$1_Square as Square, type index_d$1_Style as Style, type index_d$1_Transform as Transform };
}

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
type WidthSetupConfig = {
    aspectRatio: number;
    pixelWidth: number;
    coordinateWidth: number;
};
type HeightSetupConfig = {
    aspectRatio: number;
    pixelHeight: number;
    coordinateHeight: number;
};
type SceneCanvasConfig = (WidthSetupConfig | HeightSetupConfig) & {
    viewport?: THREE.Vector4;
};
declare class Scene extends Scene$1 {
    forwardEvent: (e: any) => void;
    add(...objects: THREE.Object3D[]): this;
    remove(...objects: THREE.Object3D[]): this;
}
declare const setupCanvas: (canvas: HTMLCanvasElement, config?: SceneCanvasConfig) => [Scene, THREE.Camera, THREE.WebGPURenderer];
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
declare const pointAlongCurve: (shape: Shape, t: number) => THREE.Vector3 | undefined;
declare const intersectionsBetween: (shape1: Shape, shape2: Shape) => Array<THREE.Vector3>;
declare const positiveAngleTo: (a: THREE.Vector3, b: THREE.Vector3) => number;
declare const indexOrThrow: <T>(array: T[], i: number) => T & ({} | null);
declare const bufferIndexOrThrow: (array: Float32Array, i: number) => number;
declare class ShapeFromCurves {
    adjacentThreshold: number;
    segmentClosestToPoint: THREE.Vector3;
    pointToSegment: THREE.Vector3;
    points: Array<THREE.Vector3>;
    style: Style;
    withStyle(style: Style): this;
    startAt(start: THREE.Vector3): this;
    extendAlong(shape: Shape, direction: THREE.Vector3, until?: THREE.Vector3 | undefined): this;
    extendCurve(shape: Shape, initialPointIndex: number, forward: boolean, until?: THREE.Vector3 | undefined): void;
    finish(): Polygon;
}

declare const utils_d_BUFFER: typeof BUFFER;
declare const utils_d_DOWN: typeof DOWN;
type utils_d_HeightSetupConfig = HeightSetupConfig;
declare const utils_d_IN: typeof IN;
declare const utils_d_LEFT: typeof LEFT;
declare const utils_d_ORIGIN: typeof ORIGIN;
declare const utils_d_OUT: typeof OUT;
declare const utils_d_RIGHT: typeof RIGHT;
type utils_d_SceneCanvasConfig = SceneCanvasConfig;
type utils_d_ShapeFromCurves = ShapeFromCurves;
declare const utils_d_ShapeFromCurves: typeof ShapeFromCurves;
declare const utils_d_UP: typeof UP;
type utils_d_WidthSetupConfig = WidthSetupConfig;
declare const utils_d_bufferIndexOrThrow: typeof bufferIndexOrThrow;
declare const utils_d_clamp: typeof clamp;
declare const utils_d_convertWorldDirectionToObjectSpace: typeof convertWorldDirectionToObjectSpace;
declare const utils_d_furthestInDirection: typeof furthestInDirection;
declare const utils_d_getBoundingBoxCenter: typeof getBoundingBoxCenter;
declare const utils_d_getBoundingBoxHelper: typeof getBoundingBoxHelper;
declare const utils_d_getFrameAttributes: typeof getFrameAttributes;
declare const utils_d_indexOrThrow: typeof indexOrThrow;
declare const utils_d_intersectionsBetween: typeof intersectionsBetween;
declare const utils_d_moveAbove: typeof moveAbove;
declare const utils_d_moveBelow: typeof moveBelow;
declare const utils_d_moveNextTo: typeof moveNextTo;
declare const utils_d_moveToLeftOf: typeof moveToLeftOf;
declare const utils_d_moveToRightOf: typeof moveToRightOf;
declare const utils_d_pointAlongCurve: typeof pointAlongCurve;
declare const utils_d_positiveAngleTo: typeof positiveAngleTo;
declare const utils_d_rotate180: typeof rotate180;
declare const utils_d_rotate270: typeof rotate270;
declare const utils_d_rotate90: typeof rotate90;
declare const utils_d_setupCanvas: typeof setupCanvas;
declare const utils_d_transformBetweenSpaces: typeof transformBetweenSpaces;
declare const utils_d_vspace: typeof vspace;
declare const utils_d_vstack: typeof vstack;
declare namespace utils_d {
  export { utils_d_BUFFER as BUFFER, utils_d_DOWN as DOWN, type utils_d_HeightSetupConfig as HeightSetupConfig, utils_d_IN as IN, utils_d_LEFT as LEFT, utils_d_ORIGIN as ORIGIN, utils_d_OUT as OUT, utils_d_RIGHT as RIGHT, type utils_d_SceneCanvasConfig as SceneCanvasConfig, utils_d_ShapeFromCurves as ShapeFromCurves, utils_d_UP as UP, type utils_d_WidthSetupConfig as WidthSetupConfig, utils_d_bufferIndexOrThrow as bufferIndexOrThrow, utils_d_clamp as clamp, utils_d_convertWorldDirectionToObjectSpace as convertWorldDirectionToObjectSpace, utils_d_furthestInDirection as furthestInDirection, utils_d_getBoundingBoxCenter as getBoundingBoxCenter, utils_d_getBoundingBoxHelper as getBoundingBoxHelper, utils_d_getFrameAttributes as getFrameAttributes, utils_d_indexOrThrow as indexOrThrow, utils_d_intersectionsBetween as intersectionsBetween, utils_d_moveAbove as moveAbove, utils_d_moveBelow as moveBelow, utils_d_moveNextTo as moveNextTo, utils_d_moveToLeftOf as moveToLeftOf, utils_d_moveToRightOf as moveToRightOf, utils_d_pointAlongCurve as pointAlongCurve, utils_d_positiveAngleTo as positiveAngleTo, utils_d_rotate180 as rotate180, utils_d_rotate270 as rotate270, utils_d_rotate90 as rotate90, utils_d_setupCanvas as setupCanvas, utils_d_transformBetweenSpaces as transformBetweenSpaces, utils_d_vspace as vspace, utils_d_vstack as vstack };
}

declare class Animation {
    func: (elapsedTime: number, deltaTime: number) => void;
    scene: any;
    startTime: number;
    endTime: number;
    prevUpdateTime: number;
    beforeFunc: () => void;
    afterFunc: () => void;
    parent: any;
    object: any;
    before: any;
    after: any;
    family: any;
    reveal: any;
    hide: any;
    scale: number;
    runTime: number;
    finished: boolean;
    elapsedSinceStart: number;
    constructor(func: (elapsedTime: number, deltaTime: number) => void, { object, parent, before, after, family, reveal, hide, }?: {
        object?: undefined;
        parent?: undefined;
        before?: undefined;
        after?: undefined;
        family?: undefined;
        reveal?: undefined;
        hide?: undefined;
    });
    setUp(): void;
    tearDown(): void;
    update(worldTime: any): void;
    addBefore(before: any): void;
    addAfter(after: any): void;
}
//# sourceMappingURL=Animation.d.ts.map

declare class Shift extends Animation {
    constructor(object: THREE.Object3D, offset: THREE.Vector3, config?: any);
}

declare class MoveTo extends Animation {
    target: THREE.Object3D;
    obj: THREE.Object3D;
    start: any;
    displacement: any;
    constructor(target: THREE.Object3D, obj: THREE.Object3D, config?: any);
    setUp(): void;
}

declare class Rotate extends Animation {
    constructor(object: THREE.Object3D, angle: number, config?: any);
}

declare class Draw extends Animation {
    constructor(object: THREE.Object3D, config?: any);
}

declare class Erase extends Animation {
    object: any;
    config?: any;
    constructor(object: any, config?: any);
    tearDown(): void;
}

declare class SetScale extends Animation {
    initialScale: number;
    constructor(object: THREE.Object3D, factor: number, config?: any);
    setUp(): void;
}

declare class FadeIn extends Animation {
    initialOpacity: Map<any, any>;
    constructor(object: THREE.Object3D, config?: any);
    setUp(): void;
}

declare class SetOpacity extends Animation {
    targetOpacity: any;
    config?: any;
    initialOpacity: Map<any, any>;
    constructor(objectOrFunc: any, targetOpacity: any, config?: any);
    setUp(): void;
}

declare class FadeOut extends Animation {
    config?: any;
    initialOpacity: Map<any, any>;
    constructor(objectOrFunc: THREE.Object3D | (() => THREE.Object3D), config?: any);
    setUp(): void;
    tearDown(): void;
}

declare class Wait extends Animation {
    constructor(config?: any);
}

declare class Emphasize extends Animation {
    initialScale: number;
    largeScale: number;
    keyframe: number;
    constructor(object: THREE.Object3D, largeScale?: number, config?: any);
    setUp(): void;
}

declare class Shake extends Animation {
    constructor(object: THREE.Object3D, config?: {
        maxRotation?: number;
        frequency?: number;
    });
}

//# sourceMappingURL=index.d.ts.map

type index_d_Animation = Animation;
declare const index_d_Animation: typeof Animation;
type index_d_Draw = Draw;
declare const index_d_Draw: typeof Draw;
type index_d_Emphasize = Emphasize;
declare const index_d_Emphasize: typeof Emphasize;
type index_d_Erase = Erase;
declare const index_d_Erase: typeof Erase;
type index_d_FadeIn = FadeIn;
declare const index_d_FadeIn: typeof FadeIn;
type index_d_FadeOut = FadeOut;
declare const index_d_FadeOut: typeof FadeOut;
type index_d_MoveTo = MoveTo;
declare const index_d_MoveTo: typeof MoveTo;
type index_d_Rotate = Rotate;
declare const index_d_Rotate: typeof Rotate;
type index_d_SetOpacity = SetOpacity;
declare const index_d_SetOpacity: typeof SetOpacity;
type index_d_SetScale = SetScale;
declare const index_d_SetScale: typeof SetScale;
type index_d_Shake = Shake;
declare const index_d_Shake: typeof Shake;
type index_d_Shift = Shift;
declare const index_d_Shift: typeof Shift;
type index_d_Wait = Wait;
declare const index_d_Wait: typeof Wait;
declare namespace index_d {
  export { index_d_Animation as Animation, index_d_Draw as Draw, index_d_Emphasize as Emphasize, index_d_Erase as Erase, index_d_FadeIn as FadeIn, index_d_FadeOut as FadeOut, index_d_MoveTo as MoveTo, index_d_Rotate as Rotate, index_d_SetOpacity as SetOpacity, index_d_SetScale as SetScale, index_d_Shake as Shake, index_d_Shift as Shift, index_d_Wait as Wait };
}

declare const PIXELS_TO_COORDS: number;
declare const COORDS_TO_PIXELS: number;
declare const ERROR_THRESHOLD = 0.001;
declare const DEFAULT_BACKGROUND_HEX = 16775920;
declare const UNITS_PER_STROKE_WIDTH: number;

declare const constants_d_COORDS_TO_PIXELS: typeof COORDS_TO_PIXELS;
declare const constants_d_DEFAULT_BACKGROUND_HEX: typeof DEFAULT_BACKGROUND_HEX;
declare const constants_d_ERROR_THRESHOLD: typeof ERROR_THRESHOLD;
declare const constants_d_PIXELS_TO_COORDS: typeof PIXELS_TO_COORDS;
declare const constants_d_UNITS_PER_STROKE_WIDTH: typeof UNITS_PER_STROKE_WIDTH;
declare namespace constants_d {
  export { constants_d_COORDS_TO_PIXELS as COORDS_TO_PIXELS, constants_d_DEFAULT_BACKGROUND_HEX as DEFAULT_BACKGROUND_HEX, constants_d_ERROR_THRESHOLD as ERROR_THRESHOLD, constants_d_PIXELS_TO_COORDS as PIXELS_TO_COORDS, constants_d_UNITS_PER_STROKE_WIDTH as UNITS_PER_STROKE_WIDTH };
}

type TextStyle = {
    fillColor?: THREE.Color;
    fillOpacity?: number;
};
type TextConfig = {
    groupColoring?: Array<[number, string?]>;
    batchMaterials?: boolean;
};
declare class Text extends THREE.Group {
    text: string;
    constructor(text: string, config?: TextStyle & TextConfig);
    dispose(): void;
    clone(recursive: boolean): this;
    copy(source: this, recursive: boolean): this;
    getDimensions(): THREE.Vector2;
    getCloneAttributes(): string[];
    getAttributes(): {
        text: string;
    };
    static fromAttributes(attributes: any): Text;
    get attributeData(): {
        attribute: string;
        type: string;
        default: string;
    }[];
    toJson(): {
        className: string;
        attributes: {
            text: string;
        };
        transform: Transform;
        style: {
            fillColor: number[];
        };
    };
    static fromJson(json: any): Text;
    getTransform(): Transform;
    setTransform(transform: Transform): void;
}
//# sourceMappingURL=text.d.ts.map

type text_d_Text = Text;
declare const text_d_Text: typeof Text;
declare namespace text_d {
  export { text_d_Text as Text };
}

declare class Angle extends Shape {
    point1: THREE.Vector3;
    point2: THREE.Vector3;
    point3: THREE.Vector3;
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Style & {
        radius?: number;
        reflex?: boolean;
    });
    getAttributes(): {
        point1: THREE.Vector3;
        point2: THREE.Vector3;
        point3: THREE.Vector3;
    };
}

interface IndicatorConfig {
    tickLength?: number;
}
declare class Indicator extends THREE.Group {
    start: THREE.Vector3;
    end: THREE.Vector3;
    startTick: Line;
    endTick: Line;
    stem: Line;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: IndicatorConfig & Style);
    grow(config?: any): Animation;
}
declare class CongruentLine extends THREE.Group {
    constructor(ticks: number, start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
        tickLength?: number;
        spacing?: number;
    });
    moveToSegment(start: THREE.Vector3, end: THREE.Vector3): void;
}
declare class CongruentAngle extends THREE.Group {
    config: Style & {
        minRadius?: number;
        spacing?: number;
    };
    constructor(arcs: number, point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Style & {
        minRadius?: number;
        spacing?: number;
    });
}
declare class RightAngle extends Polyline {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: Style & {
        sideLength?: number;
    });
}
declare class Number extends THREE.Group {
    static geometries: Map<string, THREE.ShapeGeometry>;
    meshes: THREE.Mesh[];
    material: THREE.MeshBasicMaterial;
    decimals: number;
    centerData: {
        center: THREE.Vector3;
        box: THREE.Box3;
        offset: THREE.Vector3;
        worldPosition: THREE.Vector3;
    };
    constructor(value?: number, config?: {
        color?: THREE.ColorRepresentation;
        decimals?: number;
    });
    reshape(value: number, config?: {
        color?: THREE.ColorRepresentation;
        decimals?: number;
    }): void;
    updateFromValue(value: number): void;
    static extractGeometry(textShape: Text): THREE.ShapeGeometry;
    static initializeGeometries(): Map<string, THREE.ShapeGeometry>;
}
//# sourceMappingURL=diagram.d.ts.map

type diagram_d_Angle = Angle;
declare const diagram_d_Angle: typeof Angle;
type diagram_d_CongruentAngle = CongruentAngle;
declare const diagram_d_CongruentAngle: typeof CongruentAngle;
type diagram_d_CongruentLine = CongruentLine;
declare const diagram_d_CongruentLine: typeof CongruentLine;
type diagram_d_Indicator = Indicator;
declare const diagram_d_Indicator: typeof Indicator;
type diagram_d_Number = Number;
declare const diagram_d_Number: typeof Number;
type diagram_d_RightAngle = RightAngle;
declare const diagram_d_RightAngle: typeof RightAngle;
declare namespace diagram_d {
  export { diagram_d_Angle as Angle, diagram_d_CongruentAngle as CongruentAngle, diagram_d_CongruentLine as CongruentLine, diagram_d_Indicator as Indicator, diagram_d_Number as Number, diagram_d_RightAngle as RightAngle };
}

declare const _default: {
    readonly horizontal: {
        readonly nhd: {
            readonly aspectRatio: number;
            readonly coordinateHeight: 8;
            readonly pixelHeight: 360;
            readonly frameRate: 30;
        };
        readonly hd: {
            readonly aspectRatio: number;
            readonly coordinateHeight: 8;
            readonly pixelHeight: 720;
            readonly frameRate: 30;
        };
        readonly fhd: {
            readonly aspectRatio: number;
            readonly coordinateHeight: 8;
            readonly pixelHeight: 1080;
            readonly frameRate: 60;
        };
    };
    readonly vertical: {
        readonly nhd: {
            readonly aspectRatio: number;
            readonly coordinateWidth: 8;
            readonly pixelWidth: 360;
            readonly frameRate: 30;
        };
        readonly hd: {
            readonly aspectRatio: number;
            readonly coordinateWidth: 8;
            readonly pixelWidth: 720;
            readonly frameRate: 30;
        };
        readonly fhd: {
            readonly aspectRatio: number;
            readonly coordinateWidth: 8;
            readonly pixelWidth: 1080;
            readonly frameRate: 60;
        };
    };
};
//# sourceMappingURL=frame.d.ts.map

/**
 * A curve described by an equation.
 */
declare class Curve extends Polyline {
    equation: () => void;
    constructor(equation: () => void, config?: Style);
    static defaultConfig(): {
        fill: boolean;
    };
    getClassConfig(): {};
}

type graphing_d_Curve = Curve;
declare const graphing_d_Curve: typeof Curve;
declare namespace graphing_d {
  export { graphing_d_Curve as Curve };
}

type AnimationRepresentation = Animation | Array<Animation> | {
    animations: Array<Animation>;
    before?: () => void;
    after?: () => void;
    parent?: THREE.Object3D;
    runTime?: number;
    scale?: number;
} | ((t: number, dt: number) => void);
type Class<T> = new (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGPURenderer) => T;
interface StudioScene<T extends THREE.Camera = THREE.OrthographicCamera> {
    scene: THREE.Scene;
    camera: T;
    renderer: THREE.WebGPURenderer;
    animations?: Array<AnimationRepresentation>;
    update?: (deltaTime: number, time: number) => void;
}
type StudioSceneClass = Class<StudioScene>;
declare class SceneController {
    UserScene: StudioSceneClass;
    animationIndex: number;
    deltaTime: number;
    elapsedTime: number;
    firstFrame: boolean;
    fps: number;
    timePrecision: number;
    loopAnimations: Array<Animation>;
    finishedAnimationCount: number;
    userScene: StudioScene;
    private _viewport;
    aspectRatio: number;
    constructor(UserScene: StudioSceneClass, canvasRef: HTMLCanvasElement, config: SceneCanvasConfig);
    get viewport(): THREE.Vector4 | undefined;
    set viewport(value: THREE.Vector4 | undefined);
    get scene(): THREE.Scene;
    get camera(): THREE.OrthographicCamera;
    get renderer(): THREE.WebGPURenderer;
    render(): void;
    tick(deltaTime: number, render?: boolean): void;
    play(): void;
}

declare class DashAtlas {
    atlas: THREE.DataTexture;
    period: ShaderNodeObject<THREE.UniformNode<number>>;
    constructor(pattern: number[]);
    getPeriod(pattern: number[]): number;
    computeSegmentBoundaries(pattern: number[]): number[];
    generateAtlasData(pattern: number[]): Int8Array;
}

declare class WebGPUMeshLineMaterial extends THREE.MeshBasicNodeMaterial {
    dashAtlas: DashAtlas;
    uniforms: Uniforms;
    dashSpeed: number;
    previousDashOffset: number;
    constructor(uniforms: Uniforms, dashSpeed: number, dashPattern: number[], threeDimensions: boolean);
    update(dt: number): void;
    dispose(): void;
}

declare module "three" {
    interface Object3D {
        vstack(buffer?: number): THREE.Object3D;
        vspace(distanceBetween?: number): THREE.Object3D;
        setScale(factor: number): THREE.Object3D;
        moveNextTo(target: THREE.Object3D, direction: THREE.Vector3, distance?: number): void;
        moveToRightOf(target: THREE.Object3D, distance?: number): void;
        moveToLeftOf(target: THREE.Object3D, distance?: number): void;
        moveAbove(target: THREE.Object3D, distance?: number): void;
        moveBelow(target: THREE.Object3D, distance?: number): void;
        setOpacity(opacity: number, config?: any): THREE.Object3D;
        setInvisible(config?: any): THREE.Object3D;
        setVisible(config?: any): THREE.Object3D;
        setUpright(): THREE.Object3D;
        recenter(center: THREE.Vector3): THREE.Object3D;
        reorient(zRotation: number): void;
        pointAlongCurve(t: number): THREE.Vector3;
        addComponent<T extends THREE.Object3D, K extends string>(name: K, child: T): this & {
            [P in K]: T;
        };
        updateComponent(name: string, child: THREE.Object3D): void;
        removeComponent(name: string): THREE.Object3D;
        hideComponents(): THREE.Object3D;
        revealComponents(): THREE.Object3D;
        hide(): THREE.Object3D;
        reveal(): THREE.Object3D;
        isHidden(): boolean;
        isRevealed(): boolean;
        isComponent(): boolean;
        revealDescendants(config?: {
            includeSelf: boolean;
        }): this;
        hideDescendants(config?: {
            includeSelf: boolean;
        }): THREE.Object3D;
        revealAncestors(config?: {
            includeSelf: boolean;
        }): THREE.Object3D;
        hideAncestors(config?: {
            includeSelf: boolean;
        }): THREE.Object3D;
        revealLineage(): THREE.Object3D;
        hideLineage(): THREE.Object3D;
        traverseComponents(f: () => void, config?: {
            includeSelf: boolean;
        }): void;
        traverseAncestorComponents(f: () => void, config?: {
            includeSelf: boolean;
        }): void;
    }
}
type ComponentParent = THREE.Object3D & {
    components?: Map<string, THREE.Object3D>;
};
declare function component(_: ClassAccessorDecoratorTarget<ComponentParent, THREE.Object3D>, context: ClassAccessorDecoratorContext<ComponentParent, THREE.Object3D>): ClassAccessorDecoratorResult<ComponentParent, any>;
//# sourceMappingURL=index.d.ts.map

export { index_d as Animation, type AnimationRepresentation, constants_d as Constants, diagram_d as Diagram, _default as Frame, index_d$1 as Geometry, graphing_d as Graphing, type SceneCanvasConfig, SceneController, type StudioScene, text_d as Text, utils_d as Utils, WebGPUMeshLineMaterial, component, setupCanvas };
