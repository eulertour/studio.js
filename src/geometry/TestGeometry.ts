import * as THREE from "three";

const geometry = new THREE.BufferGeometry();
// prettier-ignore
geometry.setAttribute(
    "testPosition",
    new THREE.Float32BufferAttribute(
    [
          0, 1 / 7.1111, 0,
          0, 0, 0,
          1 / 7.1111, 0, 0,
          1 / 7.1111, 1 / 7.1111, 0,
    ],
    3,
    ),
);
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(
    [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0],
    3,
  ),
);
geometry.setAttribute(
  "endPosition",
  new THREE.Float32BufferAttribute([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 3),
);
geometry.setAttribute(
  "nextPosition",
  new THREE.Float32BufferAttribute([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 3),
);
geometry.setAttribute(
  "previousPosition",
  new THREE.Float32BufferAttribute(
    [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0],
    3,
  ),
);
geometry.setAttribute(
  "textureCoords",
  new THREE.Float32BufferAttribute([1, 0, 2, 3], 1),
);
geometry.setAttribute(
  "beforeArrow",
  new THREE.Float32BufferAttribute([0, 0, 0, 0], 1),
);
geometry.setAttribute(
  "arrow",
  new THREE.Float32BufferAttribute([0, 0, 0, 0], 1),
);
geometry.setAttribute(
  "start",
  new THREE.Float32BufferAttribute([1, 1, 0, 0], 1),
);
geometry.setAttribute(
  "bottom",
  new THREE.Float32BufferAttribute([0, 1, 1, 0], 1),
);
geometry.setAttribute(
  "proportion",
  new THREE.Float32BufferAttribute([0, 0, 0, 0], 1),
);
geometry.setAttribute(
  "endProportion",
  new THREE.Float32BufferAttribute([1, 1, 1, 1], 1),
);
geometry.setIndex(new THREE.Uint16BufferAttribute([0, 1, 2, 0, 2, 3], 1));
export default geometry;

