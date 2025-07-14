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
export { Animation, };
//# sourceMappingURL=Animation.d.ts.map