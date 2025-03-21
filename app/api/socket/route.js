import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("newMessage", (msg) => {
        io.emit("receiveMessage", msg);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
