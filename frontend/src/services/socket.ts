import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      // CRITICAL FIX: Use websocket-first to avoid HTTP long-polling fallback
      // which causes delayed events and desync issues
      transports: ["websocket", "polling"],
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] connection error:", err.message);
    });

    socket.on("reconnect", (attempt) => {
      console.log(`[socket] reconnected after ${attempt} attempt(s)`);
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected && !s.active) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}