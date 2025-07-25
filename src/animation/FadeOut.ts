import WebGPUMeshLine from "../geometry/WebGPUMeshLine/index.js";
import { Animation } from "./Animation.js";
import * as THREE from "three/webgpu";

export default class FadeOut extends Animation {
  initialOpacity = new Map();

  constructor(
    objectOrFunc: THREE.Object3D | (() => THREE.Object3D),
    public config?: any,
  ) {
    let family = true;
    if (config && config.family === false) {
      family = false;
    }

    super(
      (elapsedTime, _deltaTime) => {
        if (family) {
          this.object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              if (!this.initialOpacity.has(child)) {
                console.error("Unknown child");
              }

              const interpolatedOpacity = THREE.MathUtils.lerp(
                this.initialOpacity.get(child),
                0,
                elapsedTime,
              );

              if (child instanceof WebGPUMeshLine) {
                child.material.uniforms.opacity.value = interpolatedOpacity;
              } else if (child instanceof THREE.Mesh) {
                child.material.opacity = interpolatedOpacity;
              }
            }
          });
        } else {
          [this.object.stroke, this.object.fill].forEach((mesh) => {
            if (!mesh) return;

            const interpolatedOpacity = THREE.MathUtils.lerp(
              this.initialOpacity.get(mesh),
              0,
              elapsedTime,
            );

            if (mesh instanceof WebGPUMeshLine) {
              mesh.material.uniforms.opacity.value = interpolatedOpacity;
            } else if (mesh instanceof THREE.Mesh) {
              mesh.material.opacity = interpolatedOpacity;
            }
          });
        }
      },
      { object: objectOrFunc, hide: true, ...config },
    );
  }

  setUp() {
    super.setUp();
    this.object.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        this.initialOpacity.set(child, child.material.opacity);
      }
    });
  }

  tearDown() {
    if (this.config?.remove) {
      this.object.parent.remove(this.object);
    }
    if (this.config?.restore) {
      this.object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          if (!this.initialOpacity.has(child)) {
            console.error("Unknown child");
          }
          child.material.opacity = this.initialOpacity.get(child);
        }
      });
    }
    super.tearDown();
  }
}

