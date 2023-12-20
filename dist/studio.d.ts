/// <reference types="three" />

import { BufferGeometry } from 'three';
import { ShaderMaterialParameters } from 'three';
import * as THREE_2 from 'three';
import { Vector3 } from 'three';

declare namespace Animation_2 {
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
        target: THREE_2.Object3D;
        obj: THREE_2.Object3D;
        start: any;
        displacement: any;
        constructor(target: THREE_2.Object3D, obj: THREE_2.Object3D, config?: any);
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
export { Animation_2 as Animation }

export declare type AnimationRepresentation = Animation | Array<Animation> | {
    animations: Array<Animation>;
    before?: () => void;
    after?: () => void;
    parent?: THREE_2.Object3D;
};

declare type Class<T> = new (scene: THREE_2.Scene, camera: THREE_2.Camera, renderer: THREE_2.WebGLRenderer) => T;

export declare namespace Constants {
    const PIXELS_TO_COORDS: number;
    const COORDS_TO_PIXELS: number;
    const ERROR_THRESHOLD = 0.001;
    const DEFAULT_BACKGROUND_HEX = 16775920;
}

export declare namespace Diagram {
    export class Animation {
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
    export class Shift extends Animation {
        constructor(object: any, direction: any, config?: any);
    }
    export class MoveTo extends Animation {
        target: THREE_2.Object3D;
        obj: THREE_2.Object3D;
        start: any;
        displacement: any;
        constructor(target: THREE_2.Object3D, obj: THREE_2.Object3D, config?: any);
        setUp(): void;
    }
    export class Rotate extends Animation {
        constructor(object: any, angle: any, config?: any);
    }
    export class Scale extends Animation {
        constructor(object: any, factor: any, config?: any);
    }
    export class Draw extends Animation {
        constructor(object: any, config?: any);
    }
    export class Erase extends Animation {
        object: any;
        config?: any;
        constructor(object: any, config?: any);
        tearDown(): void;
    }
    export class FadeIn extends Animation {
        initialOpacity: Map<any, any>;
        constructor(object: any, config?: any);
        setUp(): void;
    }
    export class FadeOut extends Animation {
        config?: any;
        initialOpacity: Map<any, any>;
        constructor(objectOrFunc: any, config?: any);
        setUp(): void;
        tearDown(): void;
    }
    export class Wait extends Animation {
        constructor(config?: any);
    }
    export type Transform = {
        position: THREE_2.Vector3;
        rotation: THREE_2.Euler;
        scale: THREE_2.Vector3;
    };
    export type Style = {
        strokeColor?: THREE_2.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillColor?: THREE_2.Color;
        fillOpacity?: number;
    };
    export type LineAttributes = {
        start: THREE_2.Vector3;
        end: THREE_2.Vector3;
    };
    export type ArcAttributes = {
        radius: number;
        angle: number;
        closed: boolean;
    };
    export type RectangleAttributes = {
        width: number;
        height: number;
    };
    export type PolygonAttributes = {
        points: Array<THREE_2.Vector3>;
    };
    export interface IndicatorConfig {
        transformCenter?: boolean;
        tickLength?: number;
    }
    export class Indicator extends THREE_2.Group {
        start: THREE_2.Vector3;
        end: THREE_2.Vector3;
        startTick: Geometry.Line;
        endTick: Geometry.Line;
        stem: any;
        constructor(start: THREE_2.Vector3, end: THREE_2.Vector3, config?: IndicatorConfig);
        grow(config: any): Animation;
    }
    export class Congruent extends THREE_2.Group {
        ticks: number;
        constructor(ticks: number, config?: Style & {
            tickLength?: number;
            spacing?: number;
        });
        moveToSegment(start: THREE_2.Vector3, end: THREE_2.Vector3): this;
    }
}

export declare namespace Geometry {
    export class MeshLineGeometry extends BufferGeometry {
        #private;
        readonly isMeshLineGeometry = true;
        readonly type = "MeshLineGeometry";
        points: Vector3[];
        setPoints(points: Array<Vector3>, updateBounds?: boolean): void;
        setVertexData(array: WritableArrayLike<number>, offset: number, x: number, y: number, z: number): void;
        setTextureCoords(array: WritableArrayLike<number>, offset: number): void;
        setIndices(array: WritableArrayLike<number>, offset: number, startIndex: number): void;
    }
    export interface WritableArrayLike<T> {
        readonly length: number;
        [n: number]: T;
    }
    export class MeshLineMaterial extends THREE_2.ShaderMaterial {
        constructor(parameters: ShaderMaterialParameters & {
            color: THREE_2.ColorRepresentation;
            opacity: number;
            width: number;
        });
        get color(): any;
        set color(value: any);
        get width(): number;
        set width(value: number);
    }
    export type Transform = {
        position: THREE_2.Vector3;
        rotation: THREE_2.Euler;
        scale: THREE_2.Vector3;
    };
    export type Style = {
        strokeColor?: THREE_2.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillColor?: THREE_2.Color;
        fillOpacity?: number;
    };
    export type LineAttributes = {
        start: THREE_2.Vector3;
        end: THREE_2.Vector3;
    };
    export type ArcAttributes = {
        radius: number;
        angle: number;
        closed: boolean;
    };
    export type RectangleAttributes = {
        width: number;
        height: number;
    };
    export type PolygonAttributes = {
        points: Array<THREE_2.Vector3>;
    };
    const CanvasViewport: THREE_2.Vector4;
    const setGeometryViewport: (viewport: THREE_2.Vector4) => void;
    export type Fill = THREE_2.Mesh<THREE_2.ShapeGeometry, THREE_2.MeshBasicMaterial>;
    export type Stroke = THREE_2.Mesh<MeshLineGeometry, MeshLineMaterial>;
    export abstract class Shape extends THREE_2.Group {
        fill: Fill;
        stroke: Stroke;
        curveEndIndices: Array<Array<number>>;
        constructor(points: Array<THREE_2.Vector3>, config?: Style);
        get points(): Array<THREE_2.Vector3>;
        curve(curveIndex: number, worldTransform?: boolean): THREE_2.Vector3[];
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
        getDimensions(): THREE_2.Vector2;
    }
    export class Line extends Shape {
        start: THREE_2.Vector3;
        end: THREE_2.Vector3;
        transformCenter: boolean;
        constructor(start: THREE_2.Vector3, end: THREE_2.Vector3, config?: Style & {
            transformCenter?: boolean;
        });
        getClassConfig(): {
            transformCenter: boolean;
        };
        getAttributes(): LineAttributes;
        toVector(global: boolean): THREE_2.Vector3;
        static fromAttributes(attributes: LineAttributes): Line;
    }
    export class Polyline extends Shape {
        constructor(points: Array<THREE_2.Vector3>, config?: Style);
        getClassConfig(): {};
        getAttributes(): PolygonAttributes;
        static fromAttributes(attributes: PolygonAttributes): Polyline;
    }
    export class Arc extends Shape {
        radius: number;
        angle: number;
        closed: boolean;
        constructor(radius?: number, angle?: number, closed?: boolean, config?: Style);
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
        getDimensions(): THREE_2.Vector2;
    }
    export class Circle extends Arc {
        constructor(radius?: number, config?: Style);
        getCloneAttributes(): number[];
        getAttributes(): ArcAttributes;
        static fromAttributes(attributes: ArcAttributes): Circle;
        get attributeData(): {
            attribute: string;
            type: string;
            default: number;
        }[];
    }
    export class Point extends Circle {
        location: THREE_2.Vector2 | THREE_2.Vector3;
        // TODO: this.location should return this.position
        constructor(location: THREE_2.Vector2 | THREE_2.Vector3, config?: Style & {
            radius?: number;
        });
        getAttributes(): ArcAttributes;
        static fromAttributes(): Point;
    }
    export class Polygon extends Shape {
        transformCenter: boolean;
        constructor(points: Array<THREE_2.Vector3>, config?: Style & {
            transformCenter?: boolean;
        });
        getClassConfig(): {
            transformCenter: boolean;
        };
        getAttributes(): PolygonAttributes;
        static fromAttributes(attributes: PolygonAttributes): Polygon;
        get attributeData(): any[];
    }
    export class Rectangle extends Shape {
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
    /** This is a square. */
    export class Square extends Rectangle {
        sideLength: number;
        constructor(sideLength?: number, config?: {});
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

declare interface HeightSetupConfig {
    aspectRatio: number;
    pixelHeight: number;
    coordinateHeight: number;
}

export declare class SceneController {
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
    three: typeof THREE_2;
    viewport: THREE_2.Vector4;
    constructor(UserScene: Class<StudioScene>, canvasRef: HTMLCanvasElement, config: WidthSetupConfig | HeightSetupConfig | undefined);
    get scene(): THREE_2.Scene;
    get camera(): THREE_2.OrthographicCamera;
    get renderer(): THREE_2.WebGLRenderer;
    render(): void;
    tick(deltaTime: number, render?: boolean): void;
    play(): void;
    pause(): void;
    dispose(): void;
}

export declare const setupCanvas = (
canvas: HTMLCanvasElement,
config: (WidthSetupConfig | HeightSetupConfig)
& { setRendererSize: boolean }
& { viewport: THREE_2.Vector4 } = {
    aspectRatio: 16 / 9,
    pixelHeight: 720,
    coordinateHeight: 8,
    setRendererSize: true,
    viewport: new THREE.Vector4(),
}
): [THREE_2.Scene, THREE_2.Camera, THREE_2.WebGLRenderer] => {
    config = Object.assign(
        {
        aspectRatio: 16 / 9,
        pixelHeight: 720,
        coordinateHeight: 8,
        setRendererSize: true,
        viewport: new THREE.Vector4(),
    },
    config,
    );
    let aspectRatio, pixelWidth, pixelHeight, coordinateWidth, coordinateHeight;
    if (isWidthSetup(config)) {
        aspectRatio = config.aspectRatio;
        pixelWidth = config.pixelWidth;
        coordinateWidth = config.coordinateWidth;
        pixelHeight = pixelWidth / aspectRatio;
        coordinateHeight = coordinateWidth / aspectRatio;
    } else if (isHeightSetup(config)) {
        aspectRatio = config.aspectRatio;
        pixelHeight = config.pixelHeight;
        coordinateHeight = config.coordinateHeight;
        pixelWidth = pixelHeight * aspectRatio;
        coordinateWidth = coordinateHeight * aspectRatio;
    } else {
        throw new Error("Invalid config:", config);
    }

    const camera = new THREE.OrthographicCamera(
    -coordinateWidth / 2,
    coordinateWidth / 2,
    coordinateHeight / 2,
    -coordinateHeight / 2,
    1,
    11
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setClearColor(new THREE.Color(DEFAULT_BACKGROUND_HEX));
    renderer.autoClear = false;
    if (config.setRendererSize) {
        renderer.setSize(pixelWidth, pixelHeight, false);
        Geometry.CanvasViewport.set(0, 0, pixelWidth, pixelHeight);
    } else {
        Geometry.CanvasViewport.copy(config.viewport);
    }
    if (typeof window !== "undefined") {
        renderer.setPixelRatio(window.devicePixelRatio);
        Geometry.CanvasViewport.multiplyScalar(window.devicePixelRatio);
    }
    return [new THREE.Scene(), camera, renderer];
};

export declare interface StudioScene<T extends THREE_2.Camera = THREE_2.OrthographicCamera> {
    scene: THREE_2.Scene;
    camera: T;
    renderer: THREE_2.WebGLRenderer;
    animations?: Array<AnimationRepresentation>;
    loop?: (time: number, deltaTime: number) => void;
}

declare namespace Text_2 {
    type Transform = {
        position: THREE_2.Vector3;
        rotation: THREE_2.Euler;
        scale: THREE_2.Vector3;
    };
    type Style = {
        strokeColor?: THREE_2.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillColor?: THREE_2.Color;
        fillOpacity?: number;
    };
    type LineAttributes = {
        start: THREE_2.Vector3;
        end: THREE_2.Vector3;
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
        points: Array<THREE_2.Vector3>;
    };
    class Text extends THREE_2.Group {
        text: string;
        constructor(text: string, config?: {
            fillColor?: THREE_2.Color;
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
        getDimensions(): THREE_2.Vector2;
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
export { Text_2 as Text }

export { THREE_2 as THREE }

export declare namespace Utils {
    export type Transform = {
        position: THREE_2.Vector3;
        rotation: THREE_2.Euler;
        scale: THREE_2.Vector3;
    };
    export type Style = {
        strokeColor?: THREE_2.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillColor?: THREE_2.Color;
        fillOpacity?: number;
    };
    export type LineAttributes = {
        start: THREE_2.Vector3;
        end: THREE_2.Vector3;
    };
    export type ArcAttributes = {
        radius: number;
        angle: number;
        closed: boolean;
    };
    export type RectangleAttributes = {
        width: number;
        height: number;
    };
    export type PolygonAttributes = {
        points: Array<THREE_2.Vector3>;
    };
    const BUFFER = 0.5;
    const RIGHT: Readonly<THREE_2.Vector3>;
    const LEFT: Readonly<THREE_2.Vector3>;
    const UP: Readonly<THREE_2.Vector3>;
    const DOWN: Readonly<THREE_2.Vector3>;
    const OUT: Readonly<THREE_2.Vector3>;
    const IN: Readonly<THREE_2.Vector3>;
    const clamp: (num: any, min: any, max: any) => number;
    const getFrameAttributes: (aspectRatio: number, height: number) => {
        aspectRatio: number;
        height: number;
        width: number;
        coordinateHeight: number;
        coordinateWidth: number;
    };
    export interface WidthSetupConfig {
        aspectRatio: number;
        pixelWidth: number;
        coordinateWidth: number;
    }
    export interface HeightSetupConfig {
        aspectRatio: number;
        pixelHeight: number;
        coordinateHeight: number;
    }
    const setupCanvas: (canvas: HTMLCanvasElement, config?: (WidthSetupConfig | HeightSetupConfig) & {
        setRendererSize: boolean;
    } & {
        viewport: THREE_2.Vector4;
    }) => [
    THREE_2.Scene,
    THREE_2.Camera,
    THREE_2.WebGLRenderer
    ];
    const furthestInDirection: (object: any, direction: any) => THREE_2.Vector3;
    const moveNextTo: (target: any, object: any, direction: any, distance?: number) => void;
    const moveToRightOf: (target: any, object: any, distance?: number) => void;
    const moveToLeftOf: (target: any, object: any, distance?: number) => void;
    const moveAbove: (target: any, object: any, distance?: number) => void;
    const moveBelow: (target: any, object: any, distance?: number) => void;
    const getBoundingBoxCenter: (obj: THREE_2.Object3D, target: THREE_2.Vector3) => THREE_2.Vector3;
    const getBoundingBoxHelper: (obj: THREE_2.Object3D, color: string) => THREE_2.Box3Helper;
    const transformBetweenSpaces: (from: THREE_2.Object3D, to: THREE_2.Object3D, point: THREE_2.Vector3) => THREE_2.Vector3;
    const intersectionsBetween: (shape1: Geometry.Shape, shape2: Geometry.Shape) => Array<THREE_2.Vector3>;
    export class ShapeFromCurves {
        adjacentThreshold: number;
        segmentClosestToPoint: THREE_2.Vector3;
        pointToSegment: THREE_2.Vector3;
        points: Array<THREE_2.Vector3>;
        style: Style;
        withStyle(style: Style): this;
        startAt(start: THREE_2.Vector3): this;
        extendAlong(shape: Geometry.Shape, direction: THREE_2.Vector3, until?: THREE_2.Vector3 | undefined): this;
        extendCurve(shape: Geometry.Shape, initialPointIndex: number, forward: boolean, until?: THREE_2.Vector3 | undefined): void;
        finish(): Geometry.Polygon;
    }
}

declare interface WidthSetupConfig {
    aspectRatio: number;
    pixelWidth: number;
    coordinateWidth: number;
}

export { }
