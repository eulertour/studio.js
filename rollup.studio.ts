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
      // sourcemapBaseUrl: "http://localhost:5173/",
      // sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
      //   const srcIndex = relativeSourcePath.indexOf("src/");
      //   if (srcIndex === -1) return relativeSourcePath;
      //   return relativeSourcePath.slice(srcIndex);
      // },
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
