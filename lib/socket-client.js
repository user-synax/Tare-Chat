import { io } from "socket.io-client";

let socket;

export const initSocket = (userId) => {
  if (socket) return socket;

  // Use the window location to connect to the same host
  socket = io(typeof window !== "undefined" ? window.location.origin : "http://localhost:3000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to socket server");
    if (userId) {
      socket.emit("join", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
