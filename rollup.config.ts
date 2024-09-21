import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-ts";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "build/bundle.js",
      format: "es",
    },
    plugins: [
      nodeResolve({ extensions: [".js", ".ts"] }),
      ts(),
      commonjs(),
      // terser(),
    ],
  },
];
