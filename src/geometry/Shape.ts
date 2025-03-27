import * as THREE from "three";
import MeshLine, {
  MeshLineGeometry,
  MeshLineMaterial,
} from "./MeshLine/index.js";

import * as Text from "../text.js";

export type Transform = {
  position?: THREE.Vector3;
  rotation?: THREE.Euler | number;
  scale?: THREE.Vector3 | number;
};

export type Style = {
  fillColor?: THREE.Color;
  fillOpacity?: number;
  strokeColor?: THREE.Color;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDashLength?: number;
  strokeDashOffset?: number;
  dashed?: boolean;
};

const getFillGeometry = (points: Array<THREE.Vector3>) => {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) {
    shape.lineTo(point.x, point.y);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
};

type Fill = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
type Stroke = MeshLine;

/**
 * An abstract class representing a generalized shape.
 */
export default abstract class Shape extends THREE.Group {
  fill?: Fill;
  stroke?: Stroke;
  curveEndIndices: Array<Array<number>> = [];
  arrow: boolean;
  intrinsicChildren?: THREE.Group;

  constructor(
    points: Array<THREE.Vector3>,
    config: Style &
      Transform & {
        arrow?: boolean;
        stroke?: boolean;
        fill?: boolean;
        closed?: boolean;
        fillPoints?: Array<THREE.Vector3>;
      } = {},
  ) {
    super();
    config = Object.assign(Shape.defaultStyle(), config);
    if (config.position) {
      this.position.copy(config.position);
    }

    if (config.rotation !== undefined) {
      this.rotation.copy(
        typeof config.rotation === "number"
          ? new THREE.Euler(0, 0, config.rotation)
          : config.rotation,
      );
    }

    if (config.scale) {
      this.scale.copy(
        typeof config.scale === "number"
          ? new THREE.Vector3(config.scale, config.scale, config.scale)
          : config.scale,
      );
    }

    if (points === undefined) {
      config.stroke = false;
      config.fill = false;
    }

    if (config.fill) {
      if (!config.fillPoints && !points) {
        throw new Error("Fill requires either fillPoints or points");
      }

      const fillGeometry = getFillGeometry(config.fillPoints ?? points);
      const fillMaterial = new THREE.MeshBasicMaterial({
        color: config.fillColor,
        opacity: config.fillOpacity,
        transparent: true,
        side: THREE.DoubleSide,
      });
      this.fill = new THREE.Mesh(fillGeometry, fillMaterial);
      this.add(this.fill);
    }

    if (config.stroke) {
      if (!points) {
        throw new Error("Stroke requires points");
      }

      const strokeGeometry = new MeshLineGeometry(config.arrow);
      strokeGeometry.setPoints(points);

      if (config.dashed && config.strokeDashLength === 0) {
        config.strokeDashLength = 0.4;
      }

      const strokeMaterial = new MeshLineMaterial({
        color: config.strokeColor,
        opacity: config.strokeOpacity,
        transparent: true,
        side: THREE.DoubleSide,
        width: config.strokeWidth,
        dashLength: config.strokeDashLength,
        dashOffset: config.strokeDashOffset,
      });
      this.stroke = new MeshLine(strokeGeometry, strokeMaterial);
      this.add(this.stroke);
    }
  }

  forwardEvent = (e: any) => this.dispatchEvent(e);

  add(...objects: THREE.Object3D[]) {
    super.add(...objects);
    objects.forEach((object) => {
      object.addEventListener("childadded", this.forwardEvent);
      object.addEventListener("childremoved", this.forwardEvent);
    });
    return this;
  }

  remove(...objects: THREE.Object3D[]) {
    super.remove(...objects);
    objects.forEach((object) => {
      object.removeEventListener("childadded", this.forwardEvent);
      object.removeEventListener("childremoved", this.forwardEvent);
    });
    return this;
  }

  addLabel(tex: string, direction: THREE.Vector3) {
    const label = new Text.Text(tex);
    this.add(label);
    label.moveNextTo(this, direction);
  }

  static defaultStyle() {
    return {
      fill: true,
      fillColor: new THREE.Color(0xfffaf0),
      fillOpacity: 0.0,
      stroke: true,
      strokeColor: new THREE.Color(0x000000),
      strokeOpacity: 1.0,
      strokeWidth: 4,
      strokeDashLength: 0,
      strokeDashOffset: 0,
      dashed: false,
    };
  }

  static defaultConfig() {
    return {};
  }

  reshape(...args: any[]) {
    const numRequiredArguments = this.constructor.length;

    let requiredArgs;
    let config;
    if (args.length === numRequiredArguments) {
      requiredArgs = args;
      config = {};
    } else {
      requiredArgs = args.slice(0, args.length - 1);
      config = args[args.length - 1];
    }

    const newShape = new (this.constructor as new (...args: any[]) => this)(
      ...requiredArgs,
      {
        ...this.getStyle(),
        ...config,
      },
    );

    this.position.copy(newShape.position);
    this.rotation.copy(newShape.rotation);
    this.scale.copy(newShape.scale);

    this.copyStrokeAndFill(newShape);
    this.copyStyle(newShape);
    if (this.intrinsicChildren && newShape.intrinsicChildren) {
      this.intrinsicChildren.traverse((child) => {
        if (child instanceof Shape) {
          child.dispose();
        }
      });
      this.remove(this.intrinsicChildren);
      this.intrinsicChildren = newShape.intrinsicChildren;
      this.add(this.intrinsicChildren);
    }
    const newAttributes = newShape.getAttributes();
    Object.assign(this, newAttributes);
  }

  copyStroke(shape: Shape) {
    this.stroke.geometry.dispose();
    this.stroke.geometry = shape.stroke.geometry;
  }

  copyFill(shape: Shape) {
    this.fill.geometry.dispose();
    this.fill.geometry = shape.fill.geometry;
  }

  copyStrokeAndFill(shape: Shape) {
    if (this.stroke && shape.stroke) {
      this.copyStroke(shape);
    }
    if (this.fill && shape.fill) {
      this.copyFill(shape);
    }
  }

  get points(): Array<THREE.Vector3> {
    return this.stroke?.geometry?.points || [];
  }

  set points(newPoints: THREE.Vector3[]) {
    this.stroke.geometry.points = newPoints;
  }

  worldPoint(index: number) {
    return this.localToWorld(this.points[index].clone());
  }

  transformedPoint(index: number, targetSpace: THREE.Object3D) {
    const startingPoint = this.points[index].clone();
    return targetSpace.worldToLocal(this.localToWorld(startingPoint));
  }

  segment(index: number) {
    return new THREE.Line3(
      this.points[index].clone(),
      this.points[index + 1].clone(),
    );
  }

  curve(curveIndex: number, worldTransform = true) {
    const curveEndIndices = this.curveEndIndices[curveIndex];
    const curvePoints = this.points.slice(
      curveEndIndices[0],
      curveEndIndices[1] + 1,
    );
    if (worldTransform) {
      return curvePoints.map((p) => p.clone().applyMatrix4(this.matrixWorld));
    }
    return curvePoints;
  }

  get numCurves() {
    return this.curveEndIndices.length;
  }

  clear() {
    this.remove(this.stroke);
    this.remove(this.fill);
    return this;
  }

  clone(recursive?: boolean): this {
    if (recursive === true) {
      throw Error("Recursive Shape.clone() isn't implemented.");
    }

    const cloneFunc = this.constructor as new (...args: any[]) => this;
    const clone = new cloneFunc(...this.getCloneAttributes(), {
      ...this.getStyle(),
      ...this.getClassConfig(),
    });
    THREE.Object3D.prototype.copy.call(clone, this, false);
    return clone;
  }

  getClassConfig() {
    return {};
  }

  abstract getAttributes(): object;

  getCloneAttributes(): Array<unknown> {
    return [this.points];
  }

  getStyle(): Style {
    const defaultStyle = Shape.defaultStyle();
    return {
      fillColor: this.fill?.material.color ?? defaultStyle.fillColor,
      fillOpacity: this.fill?.material.opacity ?? defaultStyle.fillOpacity,
      strokeColor: this.stroke?.material.color ?? defaultStyle.strokeColor,
      strokeOpacity:
        this.stroke?.material.opacity ?? defaultStyle.strokeOpacity,
      strokeWidth: this.stroke?.material.width ?? defaultStyle.strokeWidth,
    };
  }

  restyle(
    style: Style,
    config: { includeDescendents: boolean } = { includeDescendents: false },
  ): void {
    const { fillColor, fillOpacity } = style;
    if (this.fill) {
      if (fillColor !== undefined) {
        this.fill.material.color = fillColor;
      }
      if (fillOpacity !== undefined) {
        this.fill.material.opacity = fillOpacity;
      }
    }

    const { strokeColor, strokeOpacity, strokeWidth } = style;
    if (this.stroke) {
      if (strokeColor !== undefined) {
        this.stroke.material.color = strokeColor;
      }
      if (strokeOpacity !== undefined) {
        this.stroke.material.opacity = strokeOpacity;
      }
      if (strokeWidth !== undefined) {
        this.stroke.material.width = strokeWidth;
      }

      if (style.dashed === true) {
        this.stroke.material.dashLength = 0.4;
      }
      const { strokeDashLength, strokeDashOffset } = style;
      if (strokeDashLength !== undefined) {
        this.stroke.material.dashLength = strokeDashLength;
      }
      if (strokeDashOffset !== undefined) {
        this.stroke.material.dashOffset = strokeDashOffset;
      }
    }

    if (config.includeDescendents) {
      this.traverse((child) => {
        if (child instanceof Shape) {
          child.restyle(style, { includeDescendents: false });
        }
      });
    }
  }

  copyStyle(shape: Shape) {
    this.restyle(shape.getStyle());
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

  dispose() {
    this.fill.geometry.dispose();
    this.fill.material.dispose();
    this.stroke.geometry.dispose();
    this.stroke.material.dispose();
    return this;
  }

  getDimensions() {
    const box = new THREE.Box3();
    box.setFromObject(this);
    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    return new THREE.Vector2(width, height);
  }

  closestPointToPoint(point: THREE.Vector3, target?: THREE.Vector3) {
    if (target === undefined) {
      target = new THREE.Vector3();
    }
    const segment = new THREE.Line3();
    const closestPointOnSegment = new THREE.Vector3();
    let minDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.points.length - 1; i++) {
      segment.set(this.points[i], this.points[i + 1]);
      const distance = segment
        .closestPointToPoint(point, true, closestPointOnSegment)
        .distanceTo(point);
      if (distance < minDistance) {
        minDistance = distance;
        target.copy(closestPointOnSegment);
      }
    }
    return target;
  }
}
