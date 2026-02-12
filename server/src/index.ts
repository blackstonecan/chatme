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
  maxHttpBufferSize: 10_000,
  cors: {
    origin: ["http://localhost:5173", "https://chat.arkidish.com"],
    methods: ["GET", "POST"],
  },
});

const users = new Map<string, User>();
const messages: ChatMessage[] = [];
const connectionsPerIp = new Map<string, number>();
const rateLimits = new Map<string, { count: number; resetAt: number }>();

const MAX_CONNECTIONS = 100;
const MAX_CONNECTIONS_PER_IP = 5;
const RATE_LIMIT_WINDOW = 10_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(socketId);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(socketId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

io.on("connection", (socket) => {
  if (io.engine.clientsCount > MAX_CONNECTIONS) {
    socket.disconnect(true);
    return;
  }

  const ip = socket.handshake.headers["x-real-ip"] as string
    || socket.handshake.address;

  const currentCount = connectionsPerIp.get(ip) || 0;
  if (currentCount >= MAX_CONNECTIONS_PER_IP) {
    socket.disconnect(true);
    return;
  }
  connectionsPerIp.set(ip, currentCount + 1);

  const user: User = {
    id: socket.id,
    username: generateUsername(),
  };
  users.set(socket.id, user);

  socket.emit("chat:welcome", {
    user,
    users: Array.from(users.values()),
    messages,
  });

  socket.broadcast.emit("chat:userJoined", user);

  socket.on("chat:sendMessage", (payload: { key: string; data: string }) => {
    if (isRateLimited(socket.id)) return;

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.key !== "string" ||
      typeof payload.data !== "string" ||
      payload.data.trim().length === 0
    ) return;

    const message: ChatMessage = {
      id: generateMessageId(),
      username: user.username,
      key: payload.key.slice(0, 5000),
      data: payload.data.slice(0, 5000),
      timestamp: Date.now(),
    };

    messages.push(message);
    if (messages.length > 20) messages.shift();

    io.emit("chat:message", message);
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    rateLimits.delete(socket.id);
    io.emit("chat:userLeft", user);

    const count = connectionsPerIp.get(ip) || 1;
    if (count <= 1) {
      connectionsPerIp.delete(ip);
    } else {
      connectionsPerIp.set(ip, count - 1);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`chatme server listening on port ${PORT}`);
});
