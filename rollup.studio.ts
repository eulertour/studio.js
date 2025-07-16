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
      sourcemap: true,
      sourcemapPathTransform: (relativeSourcePath) => {
        // Fix excessive ../../../ in source paths
        const normalized = relativeSourcePath.replace(/^(\.\.\/)+/, '');
        return '../../../' + normalized;
      },
    },
    external: ["three/webgpu"],
    plugins: [
      nodeResolve(),
      typescript({
        declaration: false,
        declarationMap: false,
        outDir: "build/studio/bundle",
        tsconfig: "tsconfig.build.json",
        sourceMap: true,
        inlineSources: false,
      }),
      commonjs(),
    ],
  },
  {
    input: "build/studio/dist/src/index.d.ts",
    output: {
      file: "build/studio/bundle/index.d.ts",
      format: "es",
    },
    plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  },
];
