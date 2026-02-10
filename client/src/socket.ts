import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./types";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  autoConnect: false,
});
