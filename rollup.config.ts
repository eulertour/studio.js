import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

let outDir = "build";
if (process.env.OUTDIR) {
  outDir = process.env.OUTDIR;
}

let outFile = "index.js";
if (process.env.OUTFILE) {
  outFile = process.env.OUTFILE;
}

export default [
  {
    input: "src/index.ts",
    output: {
      file: `${outDir}/${outFile}`,
      format: "es",
      sourcemap: true,
    },
    plugins: [
      nodeResolve({ extensions: [".js", ".ts"] }),
      typescript({
        declaration: true,
        declarationDir: outDir,
        emitDeclarationOnly: true,
      }),
      commonjs(),
      // terser(),
    ],
  },
];
