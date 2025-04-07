import * as THREE from "three/webgpu";

const width = 256;
const height = 1;

const size = width * height;
const data = new Uint8Array(4 * size);

const pattern = [1, 1];

let patternPeriod = 0;
for (const patternSection of pattern) {
  patternPeriod += patternSection;
}

const texelsPerPatternUnit = width / patternPeriod;
let patternIndex = 0;
let atlasIndex = 0;
let isDashSection = true;
while (atlasIndex < size) {
  const patternSection = pattern[patternIndex];
  if (patternSection === undefined) {
    throw new Error(`Invalid pattern index ${patternIndex}`);
  }
  const texelsInSection = texelsPerPatternUnit * patternSection;
  if (isDashSection) {
    for (let i = 0; i < texelsInSection; i++) {
      const stride = 4 * (atlasIndex + i);
      const prevData = data[stride - 4];
      if (prevData === undefined) continue;
      data[stride] = prevData + 1;
      data[stride + 1] = 0;
      data[stride + 2] = 0;
      data[stride + 3] = 0;
    }
  } else {
    for (let i = 0; i < texelsInSection / 2; i++) {
      const stride = 4 * (atlasIndex + i);
      const previousData = data[stride - 4];
      if (previousData === undefined) continue;
      data[stride] = previousData;
      data[stride + 1] = 0;
      data[stride + 2] = 0;
      data[stride + 3] = 0;
    }

    const dashOffLength = pattern[patternIndex];
    if (dashOffLength === undefined) {
      throw new Error("Error constructing atlas");
    }
    const preDiscontinuityValue = data[4 * atlasIndex];
    if (preDiscontinuityValue === undefined) {
      throw new Error("Error constructing atlas");
    }
    const postDiscontinuityValue =
      preDiscontinuityValue + texelsPerPatternUnit * dashOffLength;
    for (let i = texelsInSection / 2; i < texelsInSection; i++) {
      const stride = 4 * (atlasIndex + i);
      // console.log(`data[${stride}] = ${postDiscontinuityValue}`);
      data[stride] = postDiscontinuityValue;
      data[stride + 1] = 0;
      data[stride + 2] = 0;
      data[stride + 3] = 0;
    }
  }
  patternIndex += 1;
  atlasIndex += texelsInSection;
  isDashSection = !isDashSection;
}

const debug = [];
for (let i = 0; i < data.length; i += 4) {
  debug.push(data[i]);
}
console.log(debug);
// for (let j = 0; j < size; j++) {
//   const stride = j * 4;
//   // const alpha = (255 * j) / (size - 1);
//   const alpha = 0;
//   data[stride] = 255;
//   data[stride + 1] = alpha;
//   data[stride + 2] = 255;
//   data[stride + 3] = 255;
// }

const atlas = new THREE.DataTexture(data, width, height);
atlas.needsUpdate = true;
export default atlas;
