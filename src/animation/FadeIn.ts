import { Animation, AnimationConfig } from "./Animation.js";
import * as THREE from "three";

type FadeInConfig = {
  includeDescendants?: boolean;
  concealAncestors?: boolean;
} & (
  | { preserveOpacity?: boolean }
  | {
      targetOpacity?:
        | number
        | {
            stroke?: number;
            fill?: number;
          };
    }
);

type Config = AnimationConfig & FadeInConfig;

const hasStrokeMaterial = (
  obj: THREE.Object3D,
): obj is THREE.Object3D & { stroke: { material: { opacity: number } } } =>
  obj instanceof THREE.Object3D && "stroke" in obj;

const hasFillMaterial = (
  obj: THREE.Object3D,
): obj is THREE.Object3D & { fill: { material: { opacity: number } } } =>
  obj instanceof THREE.Object3D && "fill" in obj;

export default class FadeIn extends Animation {
  private OpacityTargetMode = {
    Preserve: "preserve",
    FromConfig: "fromConfig",
    Full: "full",
  } as const;

  public config: Config;
  private targetOpacities = new Map<THREE.Mesh, number>();

  constructor(
    public object: THREE.Object3D,
    userConfig: Config = {},
  ) {
    const config = {
      ...FadeIn.defaultConfig(),
      ...("targetOpacity" in userConfig ? { preserveOpacity: undefined } : {}),
      ...userConfig,
    };

    super(
      (elapsedTime) => {
        for (const [mesh, targetOpacity] of this.targetOpacities.entries()) {
          const material = this.getMaterial(mesh);
          material.opacity = THREE.MathUtils.lerp(
            0,
            targetOpacity,
            elapsedTime,
          );
        }
      },
      { object, reveal: true, ...config },
    );

    this.config = config;
  }

  setUp() {
    super.setUp();
    const concealAncestors = this.config.concealAncestors ?? false;
    if (concealAncestors) {
      this.concealAncestors();
    }
    const meshes = this.getMeshes();
    const opacityTargetMode = this.getOpacityTargetMode();
    this.setTargetOpacities(meshes, opacityTargetMode);
  }

  static defaultConfig(): FadeInConfig {
    return {
      includeDescendants: true,
      concealAncestors: false,
      preserveOpacity: true,
    };
  }

  private setTargetOpacities(
    meshes: THREE.Mesh[],
    opacityTargetMode: (typeof this.OpacityTargetMode)[keyof typeof this.OpacityTargetMode],
  ) {
    meshes.forEach((mesh: THREE.Mesh) => {
      if (opacityTargetMode === this.OpacityTargetMode.Preserve) {
        const material = this.getMaterial(mesh);
        this.targetOpacities.set(mesh, material.opacity);
      } else if (opacityTargetMode === this.OpacityTargetMode.FromConfig) {
        this.setTargetOpacityFromConfig(mesh);
      } else if (opacityTargetMode === this.OpacityTargetMode.Full) {
        this.targetOpacities.set(mesh, 1);
      }
    });
  }

  private setTargetOpacityFromConfig(mesh: THREE.Mesh) {
    if (
      !("targetOpacity" in this.config) ||
      this.config.targetOpacity === undefined
    ) {
      throw new Error("Cannot determine opacity target");
    }
    const targetOpacity = this.config.targetOpacity;
    if (typeof targetOpacity === "number") {
      this.targetOpacities.set(mesh, targetOpacity);
    } else {
      const opacity =
        "isMeshLineGeometry" in mesh.geometry &&
        mesh.geometry.isMeshLineGeometry
          ? targetOpacity.stroke
          : targetOpacity.fill;
      this.targetOpacities.set(mesh, opacity ?? 0);
    }
  }

  private getMeshes() {
    const meshes: THREE.Mesh[] = [];
    const includeDescendants = this.config.includeDescendants ?? true;
    if (includeDescendants) {
      this.object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          meshes.push(child);
        }
      });
    } else {
      if ("stroke" in this.object && this.object.stroke instanceof THREE.Mesh) {
        meshes.push(this.object.stroke);
      }
      if ("fill" in this.object && this.object.fill instanceof THREE.Mesh) {
        meshes.push(this.object.fill);
      }
    }
    return meshes;
  }

  private concealAncestors() {
    let parent = this.object.parent;
    while (parent !== null) {
      if (hasStrokeMaterial(parent)) {
        parent.stroke.material.opacity = 0;
      }
      if (hasFillMaterial(parent)) {
        parent.fill.material.opacity = 0;
      }
      parent = parent.parent;
    }
  }

  private getOpacityTargetMode() {
    if (
      "preserveOpacity" in this.config &&
      typeof this.config.preserveOpacity === "boolean"
    ) {
      return this.config.preserveOpacity
        ? this.OpacityTargetMode.Preserve
        : this.OpacityTargetMode.Full;
    } else if ("targetOpacity" in this.config) {
      return this.OpacityTargetMode.FromConfig;
    } else {
      return this.OpacityTargetMode.Full;
    }
  }

  private getMaterial(mesh: THREE.Mesh) {
    let material = Array.isArray(mesh.material)
      ? mesh.material[0]
      : mesh.material;
    if (material === undefined) {
      throw new Error("Encountered mesh with no material");
    }
    return material;
  }
}
