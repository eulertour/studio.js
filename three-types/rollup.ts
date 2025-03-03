import { dts } from "rollup-plugin-dts";

export default [
  {
    input: "three-types/index.d.ts",
    output: {
      file: "build/three/index.d.ts",
      format: "es",
    },
    plugins: [dts({ respectExternal: true })],
  },
];
