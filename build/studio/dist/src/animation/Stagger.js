import { Animation } from "./Animation.js";
export default class Stagger extends Animation {
    constructor(animations, userConfig = {}) {
        const config = {
            ...Stagger.defaultConfig(),
            ...(animations.length === 1 ? { staggerDuration: 1 } : {}),
            ...userConfig,
        };
        super(() => this.animations.forEach((animation) => animation.update(this.prevUpdateTime)), config);
        Object.defineProperty(this, "animations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: animations
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = config;
    }
    setUp() {
        super.setUp();
        const staggerDuration = this.config.staggerDuration ?? 3 / 4;
        const staggerInterval = staggerDuration !== 1
            ? (1 - staggerDuration) / (this.animations.length - 1)
            : 0;
        this.animations.forEach((animation, index) => {
            animation.startTime = index * staggerInterval;
            animation.endTime = animation.startTime + staggerDuration;
            animation.parent = animation.parent || this.parent;
            animation.before && animation.addBefore(animation.before);
            animation.after && animation.addAfter(animation.after);
            if (animation.endTime > 1.0) {
                throw new Error("All Stagger animations must finish within 1 second");
            }
        });
    }
    static defaultConfig() {
        return {
            staggerDuration: 3 / 4,
        };
    }
}
//# sourceMappingURL=Stagger.js.map