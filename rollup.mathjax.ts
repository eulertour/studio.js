import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/mathjax.ts",
  output: {
    file: "build/studio/mathjax.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      declaration: true,
      declarationDir: "./build/studio",
      declarationMap: true,
      // tsconfig: "./tsconfig.mathjax.json",
    }),
    commonjs(),
  ],
};
