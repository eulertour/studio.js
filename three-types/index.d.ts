declare module "three" {
  export interface Vector3 {
    rotate90(): Vector3;
    rotate180(): Vector3;
    rotate270(): Vector3;
    rotateZ(angle: number): Vector3;
    transformBetweenSpaces(from, to): Vector3;
  }

  class UpdaterRegistry {
    private namedUpdaters: Map<string, () => void>;
    private updaters: (() => void)[];
    private owner: any;
    constructor(owner: any);
    register(
      nameOrFunc: ((...args: any[]) => any) | string,
      func?: (...args: any[]) => any,
    ): void;
    unregister(nameOrFunc: ((...args: any[]) => any) | string): boolean;
    has(name: string): boolean;
  }

  export interface Object3D {
    updaterRegistry: UpdaterRegistry;
    update(dt: number, t: number): void;
    addUpdater(
      nameOrFunc: ((...args: any[]) => any) | string,
      func?: (...args: any[]) => any,
    ): void;
    removeUpdater(nameOrFunc: ((...args: any[]) => any) | string): boolean;
  }
}

export * from "three";
