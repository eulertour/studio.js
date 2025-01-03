import {
  Mode,
  getMode,
  waitForFirebase,
  getStorageBucket,
  uploadToStorage,
} from "./utils.ts";

const mode = getMode();
if (mode === Mode.EMULATOR) {
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
  console.log("Waiting for Firebase to come online...");
  await waitForFirebase();
}

console.log("Uploading files...");
const storage = getStorageBucket(mode);
await uploadToStorage(storage, "build/studio", "share/lib/studio");
await uploadToStorage(storage, "build/three", "share/lib/three");
await uploadToStorage(
  storage,
  "build/studio.api.json",
  "share/studio.api.json",
);

console.log("Done!");
