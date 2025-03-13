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
      func?: (...args: any[]) => any
    ): void;
    unregister(nameOrFunc: ((...args: any[]) => any) | string): boolean;
    has(name: string): boolean;
  }

  export interface Object3D {
    updaterRegistry: UpdaterRegistry;
    update(dt: number, t: number): void;
    addUpdater(
      nameOrFunc: ((...args: any[]) => any) | string,
      func?: (...args: any[]) => any
    ): void;
    removeUpdater(nameOrFunc: ((...args: any[]) => any) | string): boolean;

    vstack(buffer?: number): Object3D;
    vspace(distanceBetween?: number): Object3D;
    setScale(factor: number): Object3D;
    moveNextTo(target: Object3D, direction: Vector3, distance?: number): void;
    moveToRightOf(target: Object3D, distance?: number): void;
    moveToLeftOf(target: Object3D, distance?: number): void;
    moveAbove(target: Object3D, distance?: number): void;
    moveBelow(target: Object3D, distance?: number): void;
    setOpacity(opacity: number, config?: any): Object3D;
    setInvisible(config?: any): Object3D;
    setVisible(config?: any): Object3D;
    setUpright(): Object3D;
    recenter(center: Vector3): Object3D;
    reorient(zRotation: number): void;
    pointAlongCurve(t: number): Vector3;
    addComponent<T extends Object3D, K extends string>(
      name: K,
      child: T
    ): this & { [P in K]: T };
    // will add other half on another PR
  }
}

export * from "three";
