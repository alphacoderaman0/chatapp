import { Server } from "socket.io";

export async function GET(req) {
  if (!global.io) {
    global.io = new Server(3001, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    global.io.on("connection", (socket) => {
      console.log("A user connected");

      socket.on("newMessage", (msg) => {
        global.io.emit("receiveMessage", msg);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
  }

  return new Response("Socket initialized", { status: 200 });
}
