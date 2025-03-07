declare module "three" {
  export interface Vector3 {
    rotate90(): Vector3;
    rotate180(): Vector3;
    rotate270(): Vector3;
    rotateZ(angle: number): Vector3;
    transformBetweenSpaces(from, to): Vector3;
  }
}

export * from "three";
