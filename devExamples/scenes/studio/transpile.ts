import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const inputPath = path.join(__dirname, 'main.ts');
const outputPath = path.join(__dirname, 'main.js');

// Check if the TypeScript file exists
if (!fs.existsSync(inputPath)) {
  console.log('No studio/main.ts file found, skipping transpilation');
  process.exit(0);
}

// Read the TypeScript source
const source = fs.readFileSync(inputPath, 'utf8');

// Transpile the TypeScript code
const result = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2023,
    module: ts.ModuleKind.ESNext,
    useDefineForClassFields: false,
  }
});

// Write the JavaScript output
fs.writeFileSync(outputPath, result.outputText);

console.log(`Transpiled studio/main.ts to studio/main.js`);