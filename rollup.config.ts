import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-ts";

let outputDir = "build";
if (process.env.OUTPUT_DIR) {
  outputDir = process.env.OUTPUT_DIR;
}

export default [
  {
    input: "src/index.ts",
    output: {
      file: `${outputDir}/bundle.js`,
      format: "es",
      importAttributesKey: "with",
    },
    plugins: [
      nodeResolve({ extensions: [".js", ".ts"] }),
      ts(),
      commonjs(),
      // terser(),
    ],
  },
];
