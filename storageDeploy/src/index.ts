import { type AppOptions, initializeApp } from "firebase-admin/app";
import { dirname, join, basename, relative } from "node:path";
import { getStorage } from "firebase-admin/storage";
import { setTimeout } from "node:timers/promises";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const MODE = process.argv.join(" ").includes("--production")
  ? "production"
  : process.env["FIREBASE_STORAGE_EMULATOR_HOST"]
    ? "emulator"
    : "staging";

let ready = false;

while (!ready) {
  const response = await fetch("http://localhost:9199").catch(() => null);
  ready = response?.status == 501;

  console.log("Waiting for Firebase to come online...");
  await setTimeout(500);
}

console.log("Firebase online");

const config: AppOptions =
  MODE == "staging" || MODE == "emulator"
    ? {
        projectId: "euler-studio-staging",
        storageBucket: "euler-studio-staging.appspot.com",
      }
    : {
        projectId: "euler-studio",
        storageBucket: "euler-studio.appspot.com",
      };

const ignoreRegexes = [
  /.*node_modules.*/,
  /.*examples\/dist.*/,
  /.*examples\/build.*/,
];
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const app = initializeApp(config);
const bucket = getStorage(app).bucket();

await uploadDirectory(
  join(currentDirectory, "../../build"),
  bucket,
  ignoreRegexes,
);

await uploadDirectory(
  join(currentDirectory, "../../src"),
  bucket,
  ignoreRegexes,
);

await uploadDirectory(
  join(currentDirectory, "../../examples"),
  bucket,
  ignoreRegexes,
);

console.log("Done");

type Bucket = typeof bucket;

async function uploadDirectory(
  directory: string,
  bucket: Bucket,
  ignoreRegexes: RegExp[],
) {
  const files = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });

  for (const file of files) {
    const fullPath = join(file.path, file.name);

    if (file.isDirectory()) continue;
    if (ignoreRegexes.some((pattern) => fullPath.match(pattern))) continue;

    const destination = join("studio.js", basename(directory), file.name);
    await bucket.upload(fullPath, { destination });
  }
}
