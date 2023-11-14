import { dts } from "rollup-plugin-dts";

export default {
  input: "node_modules/@types/three/index.d.ts",
  output: {
    file: "build/three-types.d.ts",
    format: "es",
  },
  plugins: [dts({ respectExternal: true })],
};
