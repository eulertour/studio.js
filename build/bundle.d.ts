/// <reference types="three" />
import * as THREE from "three";
import { BufferGeometry, Vector3, ShaderMaterialParameters } from "three";
declare namespace Geometry {
    class MeshLineGeometry extends BufferGeometry {
        #private;
        arrow: boolean;
        readonly isMeshLineGeometry = true;
        readonly type = "MeshLineGeometry";
        points: Vector3[];
        constructor(arrow?: boolean);
        setPoints(points: Array<Vector3>, updateBounds?: boolean): void;
        setVertexData(array: WritableArrayLike<number>, offset: number, x: number, y: number, z: number): void;
        setTextureCoords(array: WritableArrayLike<number>, offset: number): void;
        setIndices(array: WritableArrayLike<number>, offset: number, startIndex: number): void;
        computeBoundingSphere(): void;
    }
    interface WritableArrayLike<T> {
        readonly length: number;
        [n: number]: T;
    }
    const CameraDimensions: THREE.Vector2;
    const setCameraDimensions: (camera: THREE.OrthographicCamera) => void;
    const CanvasViewport: THREE.Vector4;
    const setCanvasViewport: (viewport: THREE.Vector4) => void;
    class MeshLineMaterial extends THREE.ShaderMaterial {
        constructor(parameters: ShaderMaterialParameters & {
            color: THREE.ColorRepresentation;
            opacity: number;
            width: number;
        });
        get color(): any;
        set color(value: any);
        get width(): number;
        set width(value: number);
    }
    class MeshLine extends THREE.Mesh<MeshLineGeometry, MeshLineMaterial> {
        constructor(geometry: MeshLineGeometry, material: MeshLineMaterial);
    }
    type Transform = {
        position: THREE.Vector3;
        rotation: THREE.Euler;
        scale: THREE.Vector3;
    };
    type Style = {
        strokeColor?: THREE.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillColor?: THREE.Color;
        fillOpacity?: number;
    };
    type LineAttributes = {
        start: THREE.Vector3;
        end: THREE.Vector3;
    };
    type ArcAttributes = {
        radius: number;
        angle: number;
        closed: boolean;
    };
    type RectangleAttributes = {
        width: number;
        height: number;
    };
    type PolygonAttributes = {
        points: Array<THREE.Vector3>;
    };
    type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
    type Stroke = MeshLine;
    /**
     * An abstract class representing a generalized shape.
     */
    abstract class Shape extends THREE.Group {
        fill: Fill;
        stroke: Stroke;
        curveEndIndices: Array<Array<number>>;
        arrow: boolean;
        constructor(points: Array<THREE.Vector3>, config?: Style & {
            arrow?: boolean;
        });
        reshape(...args: any[]): void;
        copyStroke(shape: Shape): void;
        copyFill(shape: Shape): void;
        copyStrokeFill(shape: Shape): void;
        get points(): Array<THREE.Vector3>;
        segment(index: number): THREE.Line3;
        curve(curveIndex: number, worldTransform?: boolean): THREE.Vector3[];
        get numCurves(): number;
        getCurveEndIndices(): any[];
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
    /**
     * A segment between two points.
     *
     * @example line.ts
     */
    class Line extends Shape {
        start: THREE.Vector3;
        end: THREE.Vector3;
        constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
            arrow?: boolean;
        });
        static centeredLine(start: THREE.Vector3, end: THREE.Vector3, config?: Style): Line;
        reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
            arrow?: boolean;
        }): void;
        getClassConfig(): {};
        getAttributes(): LineAttributes;
        toVector(global: boolean): THREE.Vector3;
        static fromAttributes(attributes: LineAttributes): Line;
    }
    /**
     * An arrow derived from a line.
     *
     * @example arrow.ts
     */
    class Arrow extends Line {
        start: THREE.Vector3;
        end: THREE.Vector3;
        constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style);
        reshape(start: THREE.Vector3, end: THREE.Vector3, config?: Style): void;
    }
    /**
     * A series of connected line segments.
     *
     * @example polyline.ts
     */
    class Polyline extends Shape {
        constructor(points: Array<THREE.Vector3>, config?: Style);
        reshape(points: Array<THREE.Vector3>, config?: Style): void;
        getClassConfig(): {};
        getAttributes(): PolygonAttributes;
        static fromAttributes(attributes: PolygonAttributes): Polyline;
    }
    /**
     * A part of a circle's circumference.
     *
     * @example arc.ts
     */
    class Arc extends Shape {
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
    /**
     * A shape consisting of all points at a fixed distance from a given center.
     *
     * @example circle.ts
     */
    class Circle extends Arc {
        constructor(radius?: number, config?: Style);
        reshape(radius: number, config?: {}): void;
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
    class Point extends Circle {
        constructor(position?: THREE.Vector2 | THREE.Vector3, config?: Style & {
            radius?: number;
        });
        getAttributes(): ArcAttributes;
        static fromAttributes(): Point;
    }
    /**
     * A shape made up of line segments connected
     * to form a (usually) closed shape.
     *
     * @example polygon.ts
     */
    class Polygon extends Shape {
        constructor(points: Array<THREE.Vector3>, config?: Style);
        getClassConfig(): {};
        getAttributes(): PolygonAttributes;
        static fromAttributes(attributes: PolygonAttributes): Polygon;
        get attributeData(): any[];
    }
    /**
     * A shape with four sides and four right angles.
     *
     * @example rectangle.ts
     */
    class Rectangle extends Shape {
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
    class Square extends Rectangle {
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
}
declare namespace Utils {
    type Transform = {
        position: THREE.Vector3;
        rotation: THREE.Euler;
        scale: THREE.Vector3;
    };
    type Style = {
        strokeColor?: THREE.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillColor?: THREE.Color;
        fillOpacity?: number;
    };
    type LineAttributes = {
        start: THREE.Vector3;
        end: THREE.Vector3;
    };
    type ArcAttributes = {
        radius: number;
        angle: number;
        closed: boolean;
    };
    type RectangleAttributes = {
        width: number;
        height: number;
    };
    type PolygonAttributes = {
        points: Array<THREE.Vector3>;
    };
    const BUFFER = 0.5;
    const ORIGIN: Readonly<THREE.Vector3>;
    const RIGHT: Readonly<THREE.Vector3>;
    const LEFT: Readonly<THREE.Vector3>;
    const UP: Readonly<THREE.Vector3>;
    const DOWN: Readonly<THREE.Vector3>;
    const OUT: Readonly<THREE.Vector3>;
    const IN: Readonly<THREE.Vector3>;
    const clamp: (num: any, min: any, max: any) => number;
    const getFrameAttributes: (aspectRatio: number, height: number) => {
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
    const setupCanvas: (canvas: HTMLCanvasElement, config?: (WidthSetupConfig | HeightSetupConfig) & {
        viewport?: THREE.Vector4;
    }) => [
        THREE.Scene,
        THREE.Camera,
        THREE.WebGLRenderer
    ];
    const furthestInDirection: (object: any, direction: any) => THREE.Vector3;
    const moveNextTo: (target: any, object: any, direction: any, distance?: number) => void;
    const moveToRightOf: (target: any, object: any, distance?: number) => void;
    const moveToLeftOf: (target: any, object: any, distance?: number) => void;
    const moveAbove: (target: any, object: any, distance?: number) => void;
    const moveBelow: (target: any, object: any, distance?: number) => void;
    const getBoundingBoxCenter: (obj: THREE.Object3D, target: THREE.Vector3) => THREE.Vector3;
    const getBoundingBoxHelper: (obj: THREE.Object3D, color: string) => THREE.Box3Helper;
    const transformBetweenSpaces: (from: THREE.Object3D, to: THREE.Object3D, point: THREE.Vector3) => THREE.Vector3;
    const intersectionsBetween: (shape1: Geometry.Shape, shape2: Geometry.Shape) => Array<THREE.Vector3>;
    class ShapeFromCurves {
        adjacentThreshold: number;
        segmentClosestToPoint: THREE.Vector3;
        pointToSegment: THREE.Vector3;
        points: Array<THREE.Vector3>;
        style: Style;
        withStyle(style: Style): this;
        startAt(start: THREE.Vector3): this;
        extendAlong(shape: Geometry.Shape, direction: THREE.Vector3, until?: THREE.Vector3 | undefined): this;
        extendCurve(shape: Geometry.Shape, initialPointIndex: number, forward: boolean, until?: THREE.Vector3 | undefined): void;
        finish(): Geometry.Polygon;
    }
}
declare module "three" {
    interface Object3D {
        setScale(factor: number): Object3D;
        moveNextTo(target: Object3D, direction: Vector3, distance?: any): void;
        moveToRightOf(target: Object3D, distance?: any): void;
        moveToLeftOf(target: Object3D, distance?: any): void;
        moveAbove(target: Object3D, distance?: any): void;
        moveBelow(target: Object3D, distance?: any): void;
        setOpacity(opacity: number): Object3D;
        setInvisible(): Object3D;
        setVisible(): Object3D;
    }
}
declare namespace Animation {
    class Animation {
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
        scale: number;
        runTime: number;
        finished: boolean;
        elapsedSinceStart: number;
        constructor(func: (elapsedTime: number, deltaTime: number) => void, { object, parent, before, after }?: {
            object?: any;
            parent?: any;
            before?: any;
            after?: any;
        });
        setUp(): void;
        tearDown(): void;
        update(worldTime: any): void;
        addBefore(before: any): void;
        addAfter(after: any): void;
    }
    class Shift extends Animation {
        constructor(object: any, direction: any, config?: any);
    }
    class MoveTo extends Animation {
        target: THREE.Object3D;
        obj: THREE.Object3D;
        start: any;
        displacement: any;
        constructor(target: THREE.Object3D, obj: THREE.Object3D, config?: any);
        setUp(): void;
    }
    class Rotate extends Animation {
        constructor(object: any, angle: any, config?: any);
    }
    class Scale extends Animation {
        constructor(object: any, factor: any, config?: any);
    }
    class Draw extends Animation {
        constructor(object: any, config?: any);
    }
    class Erase extends Animation {
        object: any;
        config?: any;
        constructor(object: any, config?: any);
        tearDown(): void;
    }
    class FadeIn extends Animation {
        initialOpacity: Map<any, any>;
        constructor(object: any, config?: any);
        setUp(): void;
    }
    class FadeOut extends Animation {
        config?: any;
        initialOpacity: Map<any, any>;
        constructor(objectOrFunc: any, config?: any);
        setUp(): void;
        tearDown(): void;
    }
    class Wait extends Animation {
        constructor(config?: any);
    }
}
declare namespace Text {
    type Transform = {
        position: THREE.Vector3;
        rotation: THREE.Euler;
        scale: THREE.Vector3;
    };
    type Style = {
        strokeColor?: THREE.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillColor?: THREE.Color;
        fillOpacity?: number;
    };
    type LineAttributes = {
        start: THREE.Vector3;
        end: THREE.Vector3;
    };
    type ArcAttributes = {
        radius: number;
        angle: number;
        closed: boolean;
    };
    type RectangleAttributes = {
        width: number;
        height: number;
    };
    type PolygonAttributes = {
        points: Array<THREE.Vector3>;
    };
    class Text extends THREE.Group {
        text: string;
        constructor(text: string, config?: {
            fillColor?: THREE.Color;
            fillOpacity?: number;
            groupColoring?: Array<[
                number,
                string?
            ]>;
            batchMaterials?: boolean;
        });
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
    loop?: (time: number, deltaTime: number) => void;
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
declare namespace Diagram {
    class Animation {
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
        scale: number;
        runTime: number;
        finished: boolean;
        elapsedSinceStart: number;
        constructor(func: (elapsedTime: number, deltaTime: number) => void, { object, parent, before, after }?: {
            object?: any;
            parent?: any;
            before?: any;
            after?: any;
        });
        setUp(): void;
        tearDown(): void;
        update(worldTime: any): void;
        addBefore(before: any): void;
        addAfter(after: any): void;
    }
    class Shift extends Animation {
        constructor(object: any, direction: any, config?: any);
    }
    class MoveTo extends Animation {
        target: THREE.Object3D;
        obj: THREE.Object3D;
        start: any;
        displacement: any;
        constructor(target: THREE.Object3D, obj: THREE.Object3D, config?: any);
        setUp(): void;
    }
    class Rotate extends Animation {
        constructor(object: any, angle: any, config?: any);
    }
    class Scale extends Animation {
        constructor(object: any, factor: any, config?: any);
    }
    class Draw extends Animation {
        constructor(object: any, config?: any);
    }
    class Erase extends Animation {
        object: any;
        config?: any;
        constructor(object: any, config?: any);
        tearDown(): void;
    }
    class FadeIn extends Animation {
        initialOpacity: Map<any, any>;
        constructor(object: any, config?: any);
        setUp(): void;
    }
    class FadeOut extends Animation {
        config?: any;
        initialOpacity: Map<any, any>;
        constructor(objectOrFunc: any, config?: any);
        setUp(): void;
        tearDown(): void;
    }
    class Wait extends Animation {
        constructor(config?: any);
    }
    type Transform = {
        position: THREE.Vector3;
        rotation: THREE.Euler;
        scale: THREE.Vector3;
    };
    type Style = {
        strokeColor?: THREE.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillColor?: THREE.Color;
        fillOpacity?: number;
    };
    type LineAttributes = {
        start: THREE.Vector3;
        end: THREE.Vector3;
    };
    type ArcAttributes = {
        radius: number;
        angle: number;
        closed: boolean;
    };
    type RectangleAttributes = {
        width: number;
        height: number;
    };
    type PolygonAttributes = {
        points: Array<THREE.Vector3>;
    };
    interface IndicatorConfig {
        tickLength?: number;
    }
    class Indicator extends THREE.Group {
        start: THREE.Vector3;
        end: THREE.Vector3;
        startTick: Geometry.Line;
        endTick: Geometry.Line;
        stem: any;
        constructor(start: THREE.Vector3, end: THREE.Vector3, config?: IndicatorConfig & Style);
        grow(config: any): Animation;
    }
    class Congruent extends THREE.Group {
        ticks: number;
        constructor(ticks: number, config?: Style & {
            tickLength?: number;
            spacing?: number;
        });
        moveToSegment(start: THREE.Vector3, end: THREE.Vector3): this;
    }
}
declare namespace Constants {
    const PIXELS_TO_COORDS: number;
    const COORDS_TO_PIXELS: number;
    const ERROR_THRESHOLD = 0.001;
    const DEFAULT_BACKGROUND_HEX = 16775920;
}
declare const setCameraDimensions: (camera: THREE.OrthographicCamera) => void;
declare const setCanvasViewport: (viewport: THREE.Vector4) => void;
declare class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters: ShaderMaterialParameters & {
        color: THREE.ColorRepresentation;
        opacity: number;
        width: number;
    });
    get color(): any;
    set color(value: any);
    get width(): number;
    set width(value: number);
}
export { Geometry, Animation, Text, SceneController, setupCanvas, THREE, StudioScene, AnimationRepresentation, Utils, Diagram, Constants, setCameraDimensions, setCanvasViewport };
