import { WebSocketServer } from "ws";
const port = 8082;
const wss = new WebSocketServer({ port });
const sockets = new Set();
wss.on("connection", (ws, req) => {
    ws.on("message", (message) => {
        if (message.toString() === "subscribe") {
            sockets.add(ws);
            console.log(`Received subscription, now serving ${sockets.size}`);
            ws.send("subscribed");
        }
        if (message.toString() === "update") {
            for (const socket of sockets.values()) {
                socket.send("update");
            }
            console.log(`Updated ${sockets.size} clients`);
            ws.send("updated");
        }
    });
    ws.on("close", () => {
        if (sockets.has(ws)) {
            sockets.delete(ws);
            console.log(`Removed subscription, now serving ${sockets.size}`);
        }
    });
});
console.log(`Listening on port ${port}...`);
