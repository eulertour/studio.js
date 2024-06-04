import WebSocket from "ws";
import axios from "axios";

const isReady = async () => {
  try {
    await axios.get("http://localhost:8082");
  } catch (error: any) {
    return error.code !== "ECONNREFUSED";
  }
  return true;
};

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

const ws = new WebSocket("ws://localhost:8082");
ws.on("error", console.error);
ws.on("open", () => ws.send("update"));
ws.on("message", () => ws.close());
