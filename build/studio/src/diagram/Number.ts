import * as THREE from "three/webgpu";
import * as Text from "../text.js";
import * as Utils from "../utils.js";


export default class Number extends THREE.Group {
    static geometries = Number.initializeGeometries();
    meshes: THREE.Mesh[] = [];
    material = new THREE.MeshBasicMaterial({ color: "black" });
    decimals: number;
    centerData = {
      center: new THREE.Vector3(),
      box: new THREE.Box3(),
      offset: new THREE.Vector3(),
      worldPosition: new THREE.Vector3(),
    };
  
    constructor(
      value = 0,
      config: { color?: THREE.ColorRepresentation; decimals?: number } = {},
    ) {
      const fullConfig = {
        color: config.color ?? "black",
        decimals: config.decimals ?? 2,
      };
  
      super();
      this.material.color = new THREE.Color(fullConfig.color);
      this.decimals = fullConfig.decimals;
      this.scale.set(0.0008, -0.0008, 0.0008);
      this.updateFromValue(value);
    }
  
    reshape(
      value: number,
      config: { color?: THREE.ColorRepresentation; decimals?: number } = {},
    ) {
      const fullConfig = {
        color: config.color ?? "black",
        decimals: config.decimals ?? 2,
      };
      this.material.color = new THREE.Color(fullConfig.color);
      this.decimals = fullConfig.decimals;
      this.clear();
      this.updateFromValue(value);
    }
  
    updateFromValue(value: number) {
      const characters = value.toFixed(this.decimals).split("");
      for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
  
        if (character === undefined) {
          throw new Error(`No character at index ${i}`);
        }
  
        const geometry = Number.geometries.get(character);
        if (geometry === undefined) {
          throw new Error(`Character ${character} isn't supported in Number.`);
        }
  
        let mesh = this.meshes[i];
        if (mesh !== undefined) {
          mesh.geometry = geometry;
        } else {
          mesh = new THREE.Mesh(geometry, this.material);
          this.meshes.push(mesh);
        }
        this.add(mesh);
      }
  
      for (let i = 1; i < this.children.length; i++) {
        const previousChild = this.children[i - 1];
        const currentChild = this.children[i];
        currentChild.moveNextTo(previousChild, Utils.RIGHT, 0.025);
      }
  
      this.centerData.worldPosition.copy(this.position);
      this.localToWorld(this.centerData.worldPosition);
  
      this.centerData.box.setFromObject(this).getCenter(this.centerData.center);
      this.centerData.center.y *= -1;
  
      this.centerData.offset
        .subVectors(this.centerData.worldPosition, this.centerData.center)
        .multiplyScalar(1 / 0.0008);
  
      this.children.forEach((child) =>
        child.position.add(this.centerData.offset),
      );
    }
  
    static extractGeometry(textShape: Text.Text) {
      return textShape.children[0].children[0].children[0]
        .geometry as THREE.ShapeGeometry;
    }
  
    static initializeGeometries() {
      const geometryMap = new Map<string, THREE.ShapeGeometry>();
  
      for (let i = 0; i < 10; i++) {
        const numberShape = new Text.Text(i.toString());
        const numberGeometry = Number.extractGeometry(numberShape);
        geometryMap.set(i.toString(), numberGeometry);
      }
  
      const decimalShape = new Text.Text(".");
      const decimalGeometry = Number.extractGeometry(decimalShape);
      geometryMap.set(".", decimalGeometry);
  
      return geometryMap;
    }
  }