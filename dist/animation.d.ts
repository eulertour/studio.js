import * as THREE from "three";
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
export { Animation, Shift, MoveTo, Rotate, SetScale, Draw, Erase, FadeIn, FadeOut, SetOpacity, Wait, };
//# sourceMappingURL=animation.d.ts.map