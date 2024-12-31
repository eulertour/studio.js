import { readdir } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { type AppOptions, initializeApp } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import {
  CURRENT_DIRECTORY_TO_PROJECT_ROOT,
  STORAGE_LIBRARY_ROOT,
} from "./config.ts";

enum Mode {
  EMULATOR = "EMULATOR",
  STAGING = "STAGING",
  PRODUCTION = "PRODUCTION",
}

function getMode(): Mode {
  const modes = process.argv.filter(
    (arg) =>
      arg === "--emulator" || arg === "--staging" || arg === "--production",
  );

  if (modes.length !== 1) {
    throw new Error(
      "Please specify exactly one of: --emulator, --staging, --production",
    );
  }

  if (modes.includes("--emulator")) {
    return Mode.EMULATOR;
  }
  if (modes.includes("--staging")) {
    return Mode.STAGING;
  }
  if (modes.includes("--production")) {
    return Mode.PRODUCTION;
  }

  return Mode.EMULATOR;
}

async function waitForFirebase() {
  const MAX_WAIT_TIME_MS = 10000;
  const WAIT_INTERVAL_MS = 1000;
  let waitTimeMs = 0;
  let ready = false;
  while (!ready && waitTimeMs < MAX_WAIT_TIME_MS) {
    const response = await fetch("http://localhost:9199").catch(() => null);
    ready = response?.status === 501;

    await setTimeout(WAIT_INTERVAL_MS);
    waitTimeMs += WAIT_INTERVAL_MS;
  }
  if (!ready) {
    console.error(`Firebase didn't come online in ${MAX_WAIT_TIME_MS / 1000}s`);
    process.exit();
  }
}

function getStorageBucket(mode: Mode): Storage {
  const config: AppOptions =
    mode === Mode.EMULATOR || mode === Mode.STAGING
      ? {
          projectId: "euler-studio-staging",
          storageBucket: "euler-studio-staging.appspot.com",
        }
      : {
          projectId: "euler-studio",
          storageBucket: "euler-studio.appspot.com",
        };

  const app = initializeApp(config);
  return getStorage(app);
}

async function uploadDirectory(
  storage: Storage,
  localDirectoryPath: string,
  remoteDirectoryPath: string,
) {
  const currentDirectoryAbsolutePath = path.dirname(
    fileURLToPath(import.meta.url),
  );
  const projectRootAbsolutePath = path.resolve(
    currentDirectoryAbsolutePath,
    CURRENT_DIRECTORY_TO_PROJECT_ROOT,
  );
  const localDirectoryAbsolutePath = path.join(
    projectRootAbsolutePath,
    localDirectoryPath,
  );

  const files = await readdir(localDirectoryAbsolutePath, {
    recursive: true,
    withFileTypes: true,
  });

  for (const file of files) {
    if (file.isDirectory()) continue;

    const remoteDirectoryAbsolutePath = path.join(
      STORAGE_LIBRARY_ROOT,
      remoteDirectoryPath,
    );
    const localFileAbsolutePath = path.join(file.parentPath, file.name);
    const localFileRelativePath = path.relative(
      localDirectoryAbsolutePath,
      localFileAbsolutePath,
    );
    const remoteFileAbsolutePath = path.join(
      remoteDirectoryAbsolutePath,
      localFileRelativePath,
    );
    await storage
      .bucket()
      .upload(localFileAbsolutePath, { destination: remoteFileAbsolutePath });
  }
}

export { Mode, getMode, waitForFirebase, getStorageBucket, uploadDirectory };
