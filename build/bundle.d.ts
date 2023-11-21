/// <reference types="three" />
import * as THREE from "three";
import { BufferGeometry, Vector3, ShaderMaterialParameters } from "three";
declare namespace Geometry {
    class MeshLineGeometry extends BufferGeometry {
        #private;
        readonly isMeshLineGeometry = true;
        readonly type = "MeshLineGeometry";
        points: Vector3[];
        setPoints(points: Array<Vector3>, updateBounds?: boolean): void;
        setVertexData(array: WritableArrayLike<number>, offset: number, x: number, y: number, z: number): void;
        setTextureCoords(array: WritableArrayLike<number>, offset: number): void;
        setIndices(array: WritableArrayLike<number>, offset: number, startIndex: number): void;
    }
    interface WritableArrayLike<T> {
        readonly length: number;
        [n: number]: T;
    }
    class MeshLineMaterial extends THREE.ShaderMaterial {
        constructor(parameters: ShaderMaterialParameters & {
            color: THREE.Color;
            opacity: number;
            width: number;
        });
    }
    type Transform = {
        position: [
            number,
            number,
            number
        ];
        rotation: [
            number,
            number,
            number
        ];
        scale: number;
    };
    type Style = {
        strokeColor?: THREE.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        stroke?: boolean;
        fillColor?: THREE.Color;
        fillOpacity?: number;
        fill?: boolean;
    };
    type StyleJson = {
        strokeColor?: Array<number>;
        strokeWidth?: number;
        strokeOpacity?: number;
        stroke?: boolean;
        fillColor?: Array<number>;
        fillOpacity?: number;
        fill?: boolean;
    };
    type Representation = {
        class: string;
        attributes: object;
        transform: Transform;
        style: StyleJson;
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
    const GeometryResolution: THREE.Vector2;
    type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
    type Stroke = THREE.Mesh<MeshLineGeometry, MeshLineMaterial>;
    abstract class Shape extends THREE.Group {
        fill: Fill;
        stroke: Stroke;
        curveEndIndices: Array<Array<number>>;
        constructor(points: Array<THREE.Vector3>, config?: Style);
        get points(): Array<THREE.Vector3>;
        curve(curveIndex: number, worldTransform?: boolean): THREE.Vector3[];
        get numCurves(): number;
        getCurveEndIndices(): any[];
        clear(): this;
        clone(recursive: ?boolean): any;
        getClassConfig(): {};
        copy(source: this, recursive: boolean): this;
        abstract getAttributes(): object;
        static styleToJson: (style: Style) => StyleJson;
        static jsonToStyle: (styleJson: StyleJson) => Style;
        toJson(): {
            className: string;
            attributes: object;
            transform: Transform;
            style: StyleJson;
        };
        static fromJson(json: Representation): any;
        getCloneAttributes(): Array<unknown>;
        getStyle(): Style;
        setStyle(style: Style): void;
        getTransform(): Transform;
        setTransform(transform: Transform): void;
        dispose(): this;
        getDimensions(): THREE.Vector2;
    }
    class Line extends Shape {
        start: THREE.Vector3;
        end: THREE.Vector3;
        transformCenter: boolean;
        constructor(start: THREE.Vector3, end: THREE.Vector3, config?: Style & {
            transformCenter?: boolean;
        });
        getClassConfig(): {
            transformCenter: boolean;
        };
        get getAttributes(): LineAttributes;
        toVector(global: boolean): THREE.Vector3;
        static fromAttributes(attributes: LineAttributes): Line;
    }
    class Polyline extends Shape {
        constructor(points: Array<THREE.Vector3>, config?: Style);
        getClassConfig(): {};
        get getAttributes(): PolygonAttributes;
        static fromAttributes(attributes: PolygonAttributes): Polyline;
    }
    class Arc extends Shape {
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
        getDimensions(): THREE.Vector2;
    }
    class Circle extends Arc {
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
    class Point extends Circle {
        location: THREE.Vector2 | THREE.Vector3;
        constructor(location: THREE.Vector2 | THREE.Vector3, config?: Style & {
            radius?: number;
        });
        getAttributes(): ArcAttributes;
        static fromAttributes(): Point;
    }
    class Polygon extends Shape {
        transformCenter: boolean;
        constructor(points: Array<THREE.Vector3>, config?: Style & {
            transformCenter?: boolean;
        });
        getClassConfig(): {
            transformCenter: boolean;
        };
        getAttributes(): PolygonAttributes;
        static fromAttributes(attributes: PolygonAttributes): Polygon;
        get attributeData(): any[];
    }
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
    class Square extends Rectangle {
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
    const shapeFromJson: (json: object) => Shape;
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
        scale: any;
        finished: boolean;
        constructor(func: (elapsedTime: number, deltaTime: number) => void, { object, parent, before, after, scale }?: {
            object: any;
            parent: any;
            before: any;
            after: any;
            scale: any;
        });
        reset(): void;
        update(worldTime: any): void;
        addBefore(before: any): void;
        addAfter(after: any): void;
    }
    const Shift: (object: any, direction: any, config?: any) => Animation;
    const MoveTo: (target: THREE.Mesh, obj: THREE.Mesh, config?: any) => Animation;
    const Rotate: (object: any, angle: any, config?: any) => Animation;
    const Scale: (object: any, factor: any, config?: any) => Animation;
    const Draw: (object: any, config?: any) => Animation;
    const Erase: (object: any, config?: any) => Animation;
    const FadeIn: (objectOrFunc: any, config?: any) => Animation;
    const FadeOut: (objectOrFunc: any, config?: any) => Animation;
    const Wait: (config?: any) => Animation;
}
declare namespace Text {
    type Transform = {
        position: [
            number,
            number,
            number
        ];
        rotation: [
            number,
            number,
            number
        ];
        scale: number;
    };
    type Style = {
        strokeColor?: THREE.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        stroke?: boolean;
        fillColor?: THREE.Color;
        fillOpacity?: number;
        fill?: boolean;
    };
    type StyleJson = {
        strokeColor?: Array<number>;
        strokeWidth?: number;
        strokeOpacity?: number;
        stroke?: boolean;
        fillColor?: Array<number>;
        fillOpacity?: number;
        fill?: boolean;
    };
    type Representation = {
        class: string;
        attributes: object;
        transform: Transform;
        style: StyleJson;
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
        clone(recursive: boolean): any;
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
        static styleToJson: (style: Style) => StyleJson;
    }
    const textFromJson: (json: object) => Text;
}
declare namespace Utils {
    type Transform = {
        position: [
            number,
            number,
            number
        ];
        rotation: [
            number,
            number,
            number
        ];
        scale: number;
    };
    type Style = {
        strokeColor?: THREE.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        stroke?: boolean;
        fillColor?: THREE.Color;
        fillOpacity?: number;
        fill?: boolean;
    };
    type StyleJson = {
        strokeColor?: Array<number>;
        strokeWidth?: number;
        strokeOpacity?: number;
        stroke?: boolean;
        fillColor?: Array<number>;
        fillOpacity?: number;
        fill?: boolean;
    };
    type Representation = {
        class: string;
        attributes: object;
        transform: Transform;
        style: StyleJson;
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
    interface WidthSetupConfig {
        aspectRatio: number;
        pixelWidth: number;
        coordinateWidth: number;
    }
    interface HeightSetupConfig {
        aspectRatio: number;
        pixelHeight: number;
        coordinateHeight: number;
    }
    const setupCanvas: (canvas: HTMLCanvasElement, config?: WidthSetupConfig | HeightSetupConfig) => [
        THREE.Scene,
        THREE.Camera,
        THREE.WebGLRenderer
    ];
    const moveToRightOf: (object1: any, object2: any, distance?: number) => void;
    const moveToLeftOf: (object1: any, object2: any, distance?: number) => void;
    const moveBelow: (object1: any, object2: any, distance?: number) => void;
    const furthestInDirection: (object: any, direction: any) => THREE.Vector3;
    const moveNextTo: (object1: any, object2: any, direction: any, distance?: number) => void;
    const getBoundingBoxCenter: (obj: THREE.Mesh | THREE.Group, target: THREE.Vector3) => THREE.Vector3;
    const getBoundingBoxHelper: (obj: THREE.Mesh | THREE.Group, color: string) => THREE.Box3Helper;
    const intersectionsBetween: (shape1: Geometry.Shape, shape2: Geometry.Shape) => Array<THREE.Vector3>;
    class ShapeFromCurves {
        adjacentThreshold: number;
        segmentClosestToPoint: THREE.Vector3;
        pointToSegment: THREE.Vector3;
        points: Array<THREE.Vector3>;
        style: Style;
        withStyle(style: Style): this;
        startAt(start: THREE.Vector3): this;
        extendAlong(shape: Geometry.Shape, direction: THREE.Vector3, until: THREE.Vector3 | undefined): this;
        extendCurve(shape: Geometry.Shape, initialPointIndex: number, forward: boolean, until: THREE.Vector3 | undefined): void;
        finish(): Geometry.Polygon;
    }
}
type Class<T> = new (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) => T;
interface StudioScene {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;
    animations?: Array<Object>;
    loop?: (time: number, deltaTime: number) => void;
}
declare class SceneController {
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
    signalUpdate: () => void;
    constructor(UserScene: Class<StudioScene>, canvasRef: HTMLCanvasElement, config: WidthSetupConfig | HeightSetupConfig | undefined);
    get scene(): THREE.Scene;
    get camera(): THREE.Camera;
    get renderer(): THREE.Renderer;
    tick(deltaTime: number, render?: boolean): void;
    play(): void;
    pause(): void;
    seekForward(duration: number): void;
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
        scale: any;
        finished: boolean;
        constructor(func: (elapsedTime: number, deltaTime: number) => void, { object, parent, before, after, scale }?: {
            object: any;
            parent: any;
            before: any;
            after: any;
            scale: any;
        });
        reset(): void;
        update(worldTime: any): void;
        addBefore(before: any): void;
        addAfter(after: any): void;
    }
    const Shift: (object: any, direction: any, config?: any) => Animation;
    const MoveTo: (target: THREE.Mesh, obj: THREE.Mesh, config?: any) => Animation;
    const Rotate: (object: any, angle: any, config?: any) => Animation;
    const Scale: (object: any, factor: any, config?: any) => Animation;
    const Draw: (object: any, config?: any) => Animation;
    const Erase: (object: any, config?: any) => Animation;
    const FadeIn: (objectOrFunc: any, config?: any) => Animation;
    const FadeOut: (objectOrFunc: any, config?: any) => Animation;
    const Wait: (config?: any) => Animation;
    type Transform = {
        position: [
            number,
            number,
            number
        ];
        rotation: [
            number,
            number,
            number
        ];
        scale: number;
    };
    type Style = {
        strokeColor?: THREE.Color;
        strokeWidth?: number;
        strokeOpacity?: number;
        stroke?: boolean;
        fillColor?: THREE.Color;
        fillOpacity?: number;
        fill?: boolean;
    };
    type StyleJson = {
        strokeColor?: Array<number>;
        strokeWidth?: number;
        strokeOpacity?: number;
        stroke?: boolean;
        fillColor?: Array<number>;
        fillOpacity?: number;
        fill?: boolean;
    };
    type Representation = {
        class: string;
        attributes: object;
        transform: Transform;
        style: StyleJson;
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
    interface WidthSetupConfig {
        aspectRatio: number;
        pixelWidth: number;
        coordinateWidth: number;
    }
    interface HeightSetupConfig {
        aspectRatio: number;
        pixelHeight: number;
        coordinateHeight: number;
    }
    const setupCanvas: (canvas: HTMLCanvasElement, config?: WidthSetupConfig | HeightSetupConfig) => [
        THREE.Scene,
        THREE.Camera,
        THREE.WebGLRenderer
    ];
    const moveToRightOf: (object1: any, object2: any, distance?: number) => void;
    const moveToLeftOf: (object1: any, object2: any, distance?: number) => void;
    const moveBelow: (object1: any, object2: any, distance?: number) => void;
    const furthestInDirection: (object: any, direction: any) => THREE.Vector3;
    const moveNextTo: (object1: any, object2: any, direction: any, distance?: number) => void;
    const getBoundingBoxCenter: (obj: THREE.Mesh | THREE.Group, target: THREE.Vector3) => THREE.Vector3;
    const getBoundingBoxHelper: (obj: THREE.Mesh | THREE.Group, color: string) => THREE.Box3Helper;
    const intersectionsBetween: (shape1: Geometry.Shape, shape2: Geometry.Shape) => Array<THREE.Vector3>;
    class ShapeFromCurves {
        adjacentThreshold: number;
        segmentClosestToPoint: THREE.Vector3;
        pointToSegment: THREE.Vector3;
        points: Array<THREE.Vector3>;
        style: Style;
        withStyle(style: Style): this;
        startAt(start: THREE.Vector3): this;
        extendAlong(shape: Geometry.Shape, direction: THREE.Vector3, until: THREE.Vector3 | undefined): this;
        extendCurve(shape: Geometry.Shape, initialPointIndex: number, forward: boolean, until: THREE.Vector3 | undefined): void;
        finish(): Geometry.Polygon;
    }
    type Class<T> = new (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) => T;
    interface StudioScene {
        scene: THREE.Scene;
        camera: THREE.Camera;
        renderer: THREE.Renderer;
        animations?: Array<Object>;
        loop?: (time: number, deltaTime: number) => void;
    }
    class SceneController {
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
        signalUpdate: () => void;
        constructor(UserScene: Class<StudioScene>, canvasRef: HTMLCanvasElement, config: WidthSetupConfig | HeightSetupConfig | undefined);
        get scene(): THREE.Scene;
        get camera(): THREE.Camera;
        get renderer(): THREE.Renderer;
        tick(deltaTime: number, render?: boolean): void;
        play(): void;
        pause(): void;
        seekForward(duration: number): void;
        dispose(): void;
    }
    class Indicator extends THREE.Group {
        start: THREE.Vector3;
        end: THREE.Vector3;
        startTick: Geometry.Line;
        endTick: Geometry.Line;
        stem: any;
        constructor(start: THREE.Vector3, end: THREE.Vector3, config?: {});
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
export { SceneController, Geometry, Animation, Text, Utils, Diagram, setupCanvas };
export * as THREE from "three";
export type { StudioScene };
