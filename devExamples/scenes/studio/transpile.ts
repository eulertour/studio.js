import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const srcDir = path.join(__dirname, 'src');
const buildDir = path.join(__dirname, 'build');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Function to get all TypeScript files in src directory
function getTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTypeScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to transpile a TypeScript file
function transpileFile(inputPath: string) {
  try {
    // Calculate relative path and output path
    const relativePath = path.relative(srcDir, inputPath);
    const outputPath = path.join(buildDir, relativePath.replace(/\.ts$/, '.js'));
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
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

    console.log(`Transpiled ${relativePath} to build/${relativePath.replace(/\.ts$/, '.js')}`);
  } catch (error) {
    console.error(`Error transpiling ${inputPath}:`, error);
  }
}

// Function to transpile all TypeScript files
function transpileAll() {
  const files = getTypeScriptFiles(srcDir);
  if (files.length === 0) {
    console.log('No TypeScript files found in src directory');
    return;
  }
  
  for (const file of files) {
    transpileFile(file);
  }
}

// Initial transpilation
transpileAll();

// Check if watch mode is enabled
const watchMode = process.argv.includes('--watch') || process.argv.includes('-w');

if (watchMode) {
  console.log('Watching for changes in src directory...');
  
  // Watch the src directory for changes
  const watchers = new Map<string, fs.FSWatcher>();
  
  function watchDirectory(dir: string) {
    const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.ts')) {
        const fullPath = path.join(dir, filename);
        if (fs.existsSync(fullPath)) {
          console.log(`Detected change in ${filename}`);
          transpileFile(fullPath);
        }
      }
    });
    
    watchers.set(dir, watcher);
  }
  
  watchDirectory(srcDir);
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\nStopping watch mode...');
    for (const watcher of watchers.values()) {
      watcher.close();
    }
    process.exit(0);
  });
}