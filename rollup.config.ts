import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

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
      // sourcemap: true,
    },
    plugins: [
      nodeResolve({ extensions: [".js", ".ts"] }),
      typescript(),
      commonjs(),
      // terser(),
    ],
  },
];
