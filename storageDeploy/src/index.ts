import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { readdirSync, lstatSync } from "fs";
import path from "path";
import axios from "axios";

const isReady = async () => {
  try {
    await axios.get("http://localhost:9199");
  } catch (error: any) {
    return error.code !== "ECONNREFUSED";
  }
  return true;
};

async function* getFiles(
  directory = ".",
  ignoreRegexes: Array<RegExp>,
): AsyncGenerator<string> {
  for (const file of readdirSync(directory)) {
    const fullPath = path.join(directory, file);
    const stats = lstatSync(fullPath);

    if (
      stats.isDirectory() &&
      !stats.isSymbolicLink() &&
      ignoreRegexes.every((re) => !fullPath.match(re))
    ) {
      yield* getFiles(fullPath, ignoreRegexes);
    }

    if (stats.isFile()) {
      yield fullPath;
    }
  }
}

async function uploadDirectory(
  directory: string,
  bucket: any,
  ignoreRegexes: Array<RegExp>,
) {
  for await (const filePath of getFiles(directory, ignoreRegexes)) {
    try {
      const source = filePath;
      const destination = path.join(
        "studio.js",
        path.basename(directory),
        path.relative(directory, filePath),
      );

      await bucket.upload(source, { destination });
    } catch (e) {
      console.error(`Error uploading ${filePath}:`, e);
    }
  }
}

let appConfig;
let mode;
if (
  process.argv.length < 3 ||
  (process.argv.length >= 3 && process.argv[2] === "--staging")
) {
  if (process.argv.length < 3) {
    mode = "emulator";
  } else {
    mode = "staging";
  }
  appConfig = {
    projectId: "euler-studio-staging",
    storageBucket: "euler-studio-staging.appspot.com",
  };
} else if (process.argv.length >= 3 && process.argv[2] === "--production") {
  mode = "production";
  appConfig = {
    projectId: "euler-studio",
    storageBucket: "euler-studio.appspot.com",
  };
}

const app = initializeApp(appConfig);
const bucket = getStorage(app).bucket();
const ignoreRegexes = [/.*node_modules.*/, /.*examples\/dist.*/];

let ready = await isReady();
while (!ready) {
  const readyPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      const ready = isReady();
      resolve(ready);
    }, 1000);
  });
  ready = await readyPromise;
}

uploadDirectory("../build", bucket, ignoreRegexes);
uploadDirectory("../src", bucket, ignoreRegexes);
uploadDirectory("../examples", bucket, ignoreRegexes);
console.log(`Updated ${mode} storage`);
