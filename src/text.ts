import * as THREE from "three/webgpu";
import { SVGLoader } from "./SVGLoader.js";
import { type Transform } from "./geometry/index.js";
import tex2svg from "./mathjax.js";

type TextStyle = {
  fillColor?: THREE.Color;
  fillOpacity?: number;
};
type TextConfig = {
  groupColoring?: Array<[number, string?]>;
  batchMaterials?: boolean;
};

class Text extends THREE.Group {
  constructor(
    public text: string,
    config: TextStyle & TextConfig = {},
  ) {
    super();

    config = Object.assign(
      { fillColor: new THREE.Color("black"), fillOpacity: 1 },
      config,
    );

    let svgString = tex2svg(this.text);

    // Remove after updating to three.js r150 (https://github.com/mrdoob/three.js/issues/25548)
    const emptyPath = 'd=""';
    while (true) {
      const match = svgString.match(emptyPath);
      if (match === null) {
        break;
      }

      svgString = `${svgString.slice(0, match.index)}d="M0,0"${svgString.slice(match.index + emptyPath.length)}`;
    }

    const parseData = new SVGLoader().parse(svgString);
    const group = new THREE.Group();
    group.scale.set(0.0008, -0.0008, 0.0008);

    let groupColorsIndex = 0;
    let groupColoring;
    if (config.groupColoring !== undefined) {
      groupColoring = config.groupColoring;
    } else if (config.batchMaterials === false) {
      groupColoring = [];
      for (let i = 0; i < parseData.paths.length; i++) {
        groupColoring.push([i + 1, config.fillColor]);
      }
    } else {
      groupColoring = [[parseData.paths.length, config.fillColor]];
    }
    let material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(groupColoring[0][1]),
      opacity: config.fillOpacity,
      transparent: true,
      side: THREE.DoubleSide,
    });
    let curGroup = new THREE.Group();

    for (let i = 0; i < parseData.paths.length; i++) {
      if (
        groupColorsIndex < groupColoring.length &&
        groupColoring[groupColorsIndex].length > 1 &&
        i === groupColoring[groupColorsIndex][0]
      ) {
        group.add(curGroup);
        curGroup = new THREE.Group();
        if (
          groupColorsIndex + 1 < groupColoring.length &&
          groupColoring[groupColorsIndex + 1].length > 1
        ) {
          material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(groupColoring[groupColorsIndex + 1][1]),
            opacity: config.fillOpacity,
            transparent: true,
            side: THREE.DoubleSide,
          });
        }
        groupColorsIndex += 1;
      }
      const shapePath = parseData.paths[i];
      const shapes = SVGLoader.createShapes(shapePath);
      for (const shape of shapes) {
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
        curGroup.add(mesh);
      }
    }
    group.add(curGroup);

    const center = new THREE.Vector3();
    new THREE.Box3().setFromObject(group).getCenter(center);
    group.position.sub(center);
    this.add(group);
  }

  dispose() {
    this.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  }

  clone(recursive: boolean) {
    if (recursive === false) {
      throw Error("Text.clone() is always recursive");
    }
    const cloneFunc = this.constructor as new (...args: any[]) => this;
    const clone = new cloneFunc(...this.getCloneAttributes());
    THREE.Object3D.prototype.copy.call(clone, this, false);
    return clone;
  }

  copy(source: this, recursive: boolean) {
    if (recursive === false) {
      throw Error("Text.clone() is always recursive");
    }
    return this;
  }

  getDimensions() {
    const box = new THREE.Box3();
    box.setFromObject(this);
    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    return new THREE.Vector2(width, height);
  }

  getCloneAttributes() {
    return [this.text];
  }

  getAttributes() {
    return { text: this.text };
  }

  static fromAttributes(attributes): Text {
    const { text } = attributes;
    return new Text(text);
  }

  get attributeData() {
    return [
      {
        attribute: "text",
        type: "string",
        default: "x^2",
      },
    ];
  }

  toJson() {
    return {
      className: this.constructor.name,
      attributes: this.getAttributes(),
      transform: this.getTransform(),
      style: { fillColor: [0, 0, 0] },
    };
  }

  static fromJson(json) {
    const text = Text.fromAttributes(json.attributes);

    if (json.transform !== undefined) {
      text.setTransform(json.transform);
    }

    return text;
  }

  getTransform(): Transform {
    return {
      position: this.position.clone(),
      rotation: this.rotation.clone(),
      scale: this.scale.clone(),
    };
  }

  setTransform(transform: Transform): void {
    const { position, rotation, scale } = transform;
    this.position.copy(position);
    this.rotation.copy(rotation);
    this.scale.copy(scale);
  }
}

export { Text };
