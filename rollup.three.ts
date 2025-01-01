import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/three.ts",
  output: {
    file: "dist/three.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      declaration: true,
      declarationDir: "./dist",
      declarationMap: true,
      tsconfig: "./tsconfig.three.json",
    }),
    commonjs(),
  ],
};
