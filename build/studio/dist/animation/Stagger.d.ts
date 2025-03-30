import { Animation, AnimationConfig } from "./Animation.js";
type StaggerConfig = {
    staggerDuration?: number;
};
type Config = AnimationConfig & StaggerConfig;
export default class Stagger extends Animation {
    animations: Animation[];
    config: Config;
    constructor(animations: Animation[], userConfig?: Config);
    setUp(): void;
    static defaultConfig(): StaggerConfig;
}
export {};
//# sourceMappingURL=Stagger.d.ts.map