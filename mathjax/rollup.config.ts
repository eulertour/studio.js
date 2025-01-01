import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/mathjax.ts",
  output: {
    file: "dist/mathjax.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      declaration: true,
      declarationDir: "./dist",
      rootDir: "./src",
      declarationMap: true,
    }),
    commonjs(),
  ],
};
