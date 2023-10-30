import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-ts";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.ts",
  output: {
    file: "build/bundle.js",
    format: "es",
  },
  plugins: [
    nodeResolve({ extensions: [".js", ".ts"] }),
    ts({ transpileOnly: true }),
    commonjs(),
  ],
};
