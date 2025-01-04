import THREE from "./three.js";
import { MeshLine } from "./MeshLine/index.js";
import Shape from "./shape.js";
import Arrow from "./arrow.js";
import Line from "./line.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";
import Arc from "./arc.js";
import Circle from "./circle.js";
import Point from "./point.js";
import Rectangle from "./rectangle.js";
import Square from "./square.js";

type Transform = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

type Style = {
  fillColor?: THREE.Color;
  fillOpacity?: number;
  strokeColor?: THREE.Color;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDashLength?: number;
  strokeDashOffset?: number;
  dashed?: boolean;
};

export {
  Shape,
  Line,
  Arrow,
  Point,
  Circle,
  Arc,
  Polygon,
  Polyline,
  Rectangle,
  Square,
  MeshLine,
};

export type {
  Transform,
  Style,
};
