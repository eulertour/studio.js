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

// Function to transpile the TypeScript file
function transpile() {
  try {
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
  } catch (error) {
    console.error('Error transpiling:', error);
  }
}

// Initial transpilation
transpile();

// Check if watch mode is enabled
const watchMode = process.argv.includes('--watch') || process.argv.includes('-w');

if (watchMode) {
  console.log('Watching for changes to studio/main.ts...');
  
  // Watch the TypeScript file for changes
  fs.watchFile(inputPath, { interval: 300 }, (curr, prev) => {
    if (curr.mtime > prev.mtime) {
      console.log('Detected change in studio/main.ts');
      transpile();
    }
  });
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\nStopping watch mode...');
    fs.unwatchFile(inputPath);
    process.exit(0);
  });
}