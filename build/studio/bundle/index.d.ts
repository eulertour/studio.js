import * as THREE from 'three';
export { THREE };

declare class MeshLineGeometry extends THREE.BufferGeometry {
    #private;
    arrow: boolean;
    readonly isMeshLineGeometry = true;
    readonly type = "MeshLineGeometry";
    points: THREE.Vector3[];
    totalLength: number;
    constructor(arrow?: boolean);
    setPoints(points: Array<THREE.Vector3>, updateBounds?: boolean): void;
    setVertexData(array: WritableArrayLike<number>, offset: number, x: number, y: number, z: number): void;
    setTextureCoords(array: WritableArrayLike<number>, offset: number): void;
    setIndices(array: WritableArrayLike<number>, offset: number, startIndex: number): void;
    computeBoundingSphere(): void;
}
interface WritableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}

declare const setCameraDimensions: (camera: THREE.OrthographicCamera) => void;
declare const setCanvasViewport: (viewport: THREE.Vector4) => void;
declare class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters: THREE.ShaderMaterialParameters & {
        color: THREE.ColorRepresentation;
        opacity: number;
        width: number;
        dashLength: number;
        dashOffset: number;
    });
    get color(): any;
    set color(value: any);
    get width(): number;
    set width(value: number);
    get totalLength(): any;
    set totalLength(value: any);
    get dashLength(): any;
    set dashLength(value: any);
    get dashOffset(): any;
    set dashOffset(value: any);
}

declare class MeshLine extends THREE.Mesh<MeshLineGeometry, MeshLineMaterial> {
    constructor(geometry: MeshLineGeometry, material: MeshLineMaterial);
    get points(): THREE.Vector3[];
    get dashOffset(): number;
    set dashOffset(dashOffset: number);
}
//# sourceMappingURL=index.d.ts.map

type Transform = {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
};
type Style = {
    fillColor?: THREE.Color;
    fillOpacity?: number;
    strokeColor?: THREE.Color;
    strokeOpacity?: number;
    strokeWidth?: number;
    strokeDashLength?: number;
    strokeDashOffset?: number;
    dashed?: boolean;
};
type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
type Stroke = MeshLine;
/**
 * An abstract class representing a generalized shape.
 */
declare abstract class Shape extends THREE.Group {
    fill?: Fill;
    stroke?: Stroke;
    curveEndIndices: Array<Array<number>>;
    arrow: boolean;
    constructor(points: Array<THREE.Vector3>, config?: Style & {
        arrow?: boolean;
        stroke?: boolean;
        fill?: boolean;
    });
    static defaultStyle(): {
        fillColor: THREE.Color;
        fillOpacity: number;
        strokeColor: THREE.Color;
        strokeOpacity: number;
        strokeWidth: number;
        strokeDashLength: number;
        strokeDashOffset: number;
        dashed: boolean;
    };
    static defaultConfig(): {};
    reshape(...args: any[]): void;
    copyStroke(shape: Shape): void;
    copyFill(shape: Shape): void;
    copyStrokeFill(shape: Shape): void;
    get points(): Array<THREE.Vector3>;
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
    setStyle(style: Style): void;
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
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
        arrow?: boolean;
    });
    static defaultConfig(): {
        arrow: boolean;
    };
    static centeredLine(start: THREE.Vector3, end: THREE.Vector3, config?: Style): Line;
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
        arrow?: boolean;
    }): void;
    getClassConfig(): {};
    getAttributes(): LineAttributes;
    getVector(global?: boolean): THREE.Vector3;
    static fromAttributes(attributes: LineAttributes): Line;
}

/**
 * An arrow derived from a line.
 *
 * @example arrow.ts
 */
declare class Arrow extends Line {
    start: THREE.Vector3;
    end: THREE.Vector3;
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
    reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
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
    constructor(points: Array<THREE.Vector3>, config?: Style);
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

/**
 * A part of a circle's circumference.
 *
 * @example arc.ts
 */
type ArcAttributes = {
    radius: number;
    angle: number;
    closed: boolean;
};
declare class Arc extends Shape {
    radius: number;
    angle: number;
    closed: boolean;
    constructor(radius?: number, angle?: number, config?: Style & {
        closed?: boolean;
    });
    static defaultConfig(): {
        closed: boolean;
        fill: boolean;
    };
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

/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
declare class Circle extends Arc {
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
        fill: boolean;
        closed: boolean;
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

//# sourceMappingURL=geometry.d.ts.map

type geometry_d_Arc = Arc;
declare const geometry_d_Arc: typeof Arc;
type geometry_d_Arrow = Arrow;
declare const geometry_d_Arrow: typeof Arrow;
type geometry_d_Circle = Circle;
declare const geometry_d_Circle: typeof Circle;
type geometry_d_Line = Line;
declare const geometry_d_Line: typeof Line;
type geometry_d_MeshLine = MeshLine;
declare const geometry_d_MeshLine: typeof MeshLine;
type geometry_d_Point = Point;
declare const geometry_d_Point: typeof Point;
type geometry_d_Polygon = Polygon;
declare const geometry_d_Polygon: typeof Polygon;
type geometry_d_Polyline = Polyline;
declare const geometry_d_Polyline: typeof Polyline;
type geometry_d_Rectangle = Rectangle;
declare const geometry_d_Rectangle: typeof Rectangle;
type geometry_d_Shape = Shape;
declare const geometry_d_Shape: typeof Shape;
type geometry_d_Square = Square;
declare const geometry_d_Square: typeof Square;
declare namespace geometry_d {
  export { geometry_d_Arc as Arc, geometry_d_Arrow as Arrow, geometry_d_Circle as Circle, geometry_d_Line as Line, geometry_d_MeshLine as MeshLine, geometry_d_Point as Point, geometry_d_Polygon as Polygon, geometry_d_Polyline as Polyline, geometry_d_Rectangle as Rectangle, geometry_d_Shape as Shape, geometry_d_Square as Square };
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
declare const pointAlongCurve: (shape: Shape, t: number) => THREE.Vector3 | undefined;
declare const intersectionsBetween: (shape1: Shape, shape2: Shape) => Array<THREE.Vector3>;
declare const positiveAngleTo: (a: THREE.Vector3, b: THREE.Vector3) => number;
declare class ShapeFromCurves {
    adjacentThreshold: number;
    segmentClosestToPoint: THREE.Vector3;
    pointToSegment: THREE.Vector3;
    points: Array<THREE.Vector3>;
    style: undefined;
    withStyle(style: undefined): this;
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
type utils_d_ShapeFromCurves = ShapeFromCurves;
declare const utils_d_ShapeFromCurves: typeof ShapeFromCurves;
declare const utils_d_UP: typeof UP;
type utils_d_WidthSetupConfig = WidthSetupConfig;
declare const utils_d_clamp: typeof clamp;
declare const utils_d_convertWorldDirectionToObjectSpace: typeof convertWorldDirectionToObjectSpace;
declare const utils_d_furthestInDirection: typeof furthestInDirection;
declare const utils_d_getBoundingBoxCenter: typeof getBoundingBoxCenter;
declare const utils_d_getBoundingBoxHelper: typeof getBoundingBoxHelper;
declare const utils_d_getFrameAttributes: typeof getFrameAttributes;
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
  export { utils_d_BUFFER as BUFFER, utils_d_DOWN as DOWN, type utils_d_HeightSetupConfig as HeightSetupConfig, utils_d_IN as IN, utils_d_LEFT as LEFT, utils_d_ORIGIN as ORIGIN, utils_d_OUT as OUT, utils_d_RIGHT as RIGHT, utils_d_ShapeFromCurves as ShapeFromCurves, utils_d_UP as UP, type utils_d_WidthSetupConfig as WidthSetupConfig, utils_d_clamp as clamp, utils_d_convertWorldDirectionToObjectSpace as convertWorldDirectionToObjectSpace, utils_d_furthestInDirection as furthestInDirection, utils_d_getBoundingBoxCenter as getBoundingBoxCenter, utils_d_getBoundingBoxHelper as getBoundingBoxHelper, utils_d_getFrameAttributes as getFrameAttributes, utils_d_intersectionsBetween as intersectionsBetween, utils_d_moveAbove as moveAbove, utils_d_moveBelow as moveBelow, utils_d_moveNextTo as moveNextTo, utils_d_moveToLeftOf as moveToLeftOf, utils_d_moveToRightOf as moveToRightOf, utils_d_pointAlongCurve as pointAlongCurve, utils_d_positiveAngleTo as positiveAngleTo, utils_d_rotate180 as rotate180, utils_d_rotate270 as rotate270, utils_d_rotate90 as rotate90, utils_d_setupCanvas as setupCanvas, utils_d_transformBetweenSpaces as transformBetweenSpaces, utils_d_vspace as vspace, utils_d_vstack as vstack };
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
declare class Shift extends Animation {
    constructor(object: any, offset: any, config?: any);
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
    constructor(object: any, angle: any, config?: any);
}
declare class SetScale extends Animation {
    initialScale: number;
    constructor(object: any, factor: any, config?: any);
    setUp(): void;
}
declare class Draw extends Animation {
    constructor(object: any, config?: any);
}
declare class Erase extends Animation {
    object: any;
    config?: any;
    constructor(object: any, config?: any);
    tearDown(): void;
}
declare class FadeIn extends Animation {
    initialOpacity: Map<any, any>;
    constructor(object: any, config?: any);
    setUp(): void;
}
declare class FadeOut extends Animation {
    config?: any;
    initialOpacity: Map<any, any>;
    constructor(objectOrFunc: any, config?: any);
    setUp(): void;
    tearDown(): void;
}
declare class SetOpacity extends Animation {
    targetOpacity: any;
    config?: any;
    initialOpacity: Map<any, any>;
    constructor(objectOrFunc: any, targetOpacity: any, config?: any);
    setUp(): void;
}
declare class Wait extends Animation {
    constructor(config?: any);
}
//# sourceMappingURL=animation.d.ts.map

type animation_d_Animation = Animation;
declare const animation_d_Animation: typeof Animation;
type animation_d_Draw = Draw;
declare const animation_d_Draw: typeof Draw;
type animation_d_Erase = Erase;
declare const animation_d_Erase: typeof Erase;
type animation_d_FadeIn = FadeIn;
declare const animation_d_FadeIn: typeof FadeIn;
type animation_d_FadeOut = FadeOut;
declare const animation_d_FadeOut: typeof FadeOut;
type animation_d_MoveTo = MoveTo;
declare const animation_d_MoveTo: typeof MoveTo;
type animation_d_Rotate = Rotate;
declare const animation_d_Rotate: typeof Rotate;
type animation_d_SetOpacity = SetOpacity;
declare const animation_d_SetOpacity: typeof SetOpacity;
type animation_d_SetScale = SetScale;
declare const animation_d_SetScale: typeof SetScale;
type animation_d_Shift = Shift;
declare const animation_d_Shift: typeof Shift;
type animation_d_Wait = Wait;
declare const animation_d_Wait: typeof Wait;
declare namespace animation_d {
  export { animation_d_Animation as Animation, animation_d_Draw as Draw, animation_d_Erase as Erase, animation_d_FadeIn as FadeIn, animation_d_FadeOut as FadeOut, animation_d_MoveTo as MoveTo, animation_d_Rotate as Rotate, animation_d_SetOpacity as SetOpacity, animation_d_SetScale as SetScale, animation_d_Shift as Shift, animation_d_Wait as Wait };
}

declare const PIXELS_TO_COORDS: number;
declare const COORDS_TO_PIXELS: number;
declare const ERROR_THRESHOLD = 0.001;
declare const DEFAULT_BACKGROUND_HEX = 16775920;
//# sourceMappingURL=constants.d.ts.map

declare const constants_d_COORDS_TO_PIXELS: typeof COORDS_TO_PIXELS;
declare const constants_d_DEFAULT_BACKGROUND_HEX: typeof DEFAULT_BACKGROUND_HEX;
declare const constants_d_ERROR_THRESHOLD: typeof ERROR_THRESHOLD;
declare const constants_d_PIXELS_TO_COORDS: typeof PIXELS_TO_COORDS;
declare namespace constants_d {
  export { constants_d_COORDS_TO_PIXELS as COORDS_TO_PIXELS, constants_d_DEFAULT_BACKGROUND_HEX as DEFAULT_BACKGROUND_HEX, constants_d_ERROR_THRESHOLD as ERROR_THRESHOLD, constants_d_PIXELS_TO_COORDS as PIXELS_TO_COORDS };
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
    constructor(start: THREE.Vector3, end: THREE.Vector3, config?: IndicatorConfig & undefined);
    grow(config?: any): Animation;
}
declare class CongruentLine extends THREE.Group {
    constructor(ticks: number, start: THREE.Vector3, end: THREE.Vector3, config?: undefined & {
        tickLength?: number;
        spacing?: number;
    });
}
declare class CongruentAngle extends THREE.Group {
    config: undefined & {
        minRadius?: number;
        spacing?: number;
    };
    constructor(arcs: number, point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: undefined & {
        minRadius?: number;
        spacing?: number;
    });
}
declare class Angle extends Arc {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: undefined & {
        radius?: number;
        reflex?: boolean;
    });
}
declare class RightAngle extends Polyline {
    constructor(point1: THREE.Vector3, point2: THREE.Vector3, point3: THREE.Vector3, config?: undefined & {
        sideLength?: number;
    });
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
type diagram_d_RightAngle = RightAngle;
declare const diagram_d_RightAngle: typeof RightAngle;
declare namespace diagram_d {
  export { diagram_d_Angle as Angle, diagram_d_CongruentAngle as CongruentAngle, diagram_d_CongruentLine as CongruentLine, diagram_d_Indicator as Indicator, diagram_d_RightAngle as RightAngle };
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

type Class<T> = new (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => T;
type AnimationRepresentation = Animation | Array<Animation> | {
    animations: Array<Animation>;
    before?: () => void;
    after?: () => void;
    parent?: THREE.Object3D;
    runTime?: number;
    scale?: number;
};
interface StudioScene<T extends THREE.Camera = THREE.OrthographicCamera> {
    scene: THREE.Scene;
    camera: T;
    renderer: THREE.WebGLRenderer;
    animations?: Array<AnimationRepresentation>;
    update?: (deltaTime: number, time: number) => void;
}
declare class SceneController {
    UserScene: Class<StudioScene>;
    animationIndex: number;
    deltaTime: number;
    elapsedTime: number;
    firstFrame: boolean;
    paused: boolean;
    fps: number;
    timePrecision: number;
    startTime: number;
    endTime: number;
    loopAnimations: Array<Animation>;
    finishedAnimationCount: number;
    userScene: StudioScene;
    three: typeof THREE;
    viewport: THREE.Vector4;
    aspectRatio: number;
    constructor(UserScene: Class<StudioScene>, canvasRef: HTMLCanvasElement, config: (WidthSetupConfig | HeightSetupConfig) & {
        viewport?: THREE.Vector4;
    });
    get scene(): THREE.Scene;
    get camera(): THREE.OrthographicCamera;
    get renderer(): THREE.WebGLRenderer;
    render(): void;
    tick(deltaTime: number, render?: boolean): void;
    play(): void;
    pause(): void;
    dispose(): void;
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

declare module "three" {
    interface Object3D {
        vstack(buffer?: number): THREE.Object3D;
        vspace(distanceBetween?: number): THREE.Object3D;
        setScale(factor: number): THREE.Object3D;
        moveNextTo(target: THREE.Object3D, direction: THREE.Vector3, distance?: any): void;
        moveToRightOf(target: THREE.Object3D, distance?: any): void;
        moveToLeftOf(target: THREE.Object3D, distance?: any): void;
        moveAbove(target: THREE.Object3D, distance?: any): void;
        moveBelow(target: THREE.Object3D, distance?: any): void;
        setOpacity(opacity: number): THREE.Object3D;
        setInvisible(): THREE.Object3D;
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
    interface Vector3 {
        rotate90(): THREE.Vector3;
        rotate180(): THREE.Vector3;
        rotate270(): THREE.Vector3;
        rotateZ(angle: number): THREE.Vector3;
        transformBetweenSpaces(from: THREE.Object3D, to: THREE.Object3D): THREE.Vector3;
        positiveAngleTo(vector: THREE.Vector3): number;
    }
}
type ComponentParent = THREE.Object3D & {
    components?: Map<string, THREE.Object3D>;
};
declare function component(_: ClassAccessorDecoratorTarget<ComponentParent, THREE.Object3D>, context: ClassAccessorDecoratorContext<ComponentParent, THREE.Object3D>): ClassAccessorDecoratorResult<ComponentParent, any>;
//# sourceMappingURL=index.d.ts.map

export { animation_d as Animation, type AnimationRepresentation, constants_d as Constants, diagram_d as Diagram, _default as Frame, geometry_d as Geometry, graphing_d as Graphing, SceneController, type StudioScene, text_d as Text, utils_d as Utils, component, setCameraDimensions, setCanvasViewport, setupCanvas };
