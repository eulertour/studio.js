import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { dts } from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "build/studio/bundle/index.js",
      format: "es",
    },
    external: ["three"],
    plugins: [
      nodeResolve(),
      typescript({
        declaration: false,
        declarationMap: false,
        outDir: "build/studio/bundle",
        tsconfig: "tsconfig.build.json",
      }),
      commonjs(),
    ],
  },
  {
    input: "build/studio/dist/index.d.ts",
    output: {
      file: "build/studio/bundle/index.d.ts",
      format: "es",
    },
    plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  },
];
