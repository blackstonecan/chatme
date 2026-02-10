import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents, User, ChatMessage } from "./types.js";
import { generateUsername, generateMessageId } from "./utils.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const STATIC_DIR = join(import.meta.dirname, "../../client/dist");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const httpServer = createServer((req, res) => {
  let filePath = join(STATIC_DIR, req.url === "/" ? "index.html" : req.url!);

  if (!existsSync(filePath)) {
    filePath = join(STATIC_DIR, "index.html");
  }

  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const users = new Map<string, User>();

io.on("connection", (socket) => {
  const user: User = {
    id: socket.id,
    username: generateUsername(),
  };
  users.set(socket.id, user);

  socket.emit("chat:welcome", {
    user,
    users: Array.from(users.values()),
  });

  socket.broadcast.emit("chat:userJoined", user);

  socket.on("chat:sendMessage", (content: string) => {
    if (typeof content !== "string" || content.trim().length === 0) return;
    const trimmed = content.trim().slice(0, 1000);

    const message: ChatMessage = {
      id: generateMessageId(),
      username: user.username,
      content: trimmed,
      timestamp: Date.now(),
    };

    io.emit("chat:message", message);
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("chat:userLeft", user);
  });
});

httpServer.listen(PORT, () => {
  console.log(`chatme server listening on port ${PORT}`);
});
