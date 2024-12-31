import {
  Mode,
  getMode,
  waitForFirebase,
  getStorageBucket,
  uploadDirectory,
} from "./utils.ts";

const mode = getMode();
if (mode === Mode.EMULATOR) {
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
  console.log("Waiting for Firebase to come online...");
  await waitForFirebase();
}

console.log("Uploading files...");
const storage = getStorageBucket(mode);
await uploadDirectory(storage, "dist", "build");
await uploadDirectory(storage, "src", "src");

console.log("Done!");
