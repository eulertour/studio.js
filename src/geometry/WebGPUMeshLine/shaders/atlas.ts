import * as THREE from "three/webgpu";

const width = 512;
const height = 512;

const size = width * height;
const data = new Uint8Array(4 * size);

for (let j = 0; j < size; j++) {
  const stride = j * 4;
  const alpha = (255 * j) / (size - 1);
  data[stride] = alpha;
  data[stride + 1] = alpha;
  data[stride + 2] = alpha;
  data[stride + 3] = alpha;
}

const atlas = new THREE.DataTexture(data, width, height);
atlas.needsUpdate = true;
export default atlas;
