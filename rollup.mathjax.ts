import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/mathjax.ts",
  output: {
    file: "build/studio/dist/mathjax.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      declaration: true,
      declarationMap: true,
      declarationDir: "build/studio/dist",
      outDir: "build/studio/dist",
    }),
    commonjs(),
  ],
};