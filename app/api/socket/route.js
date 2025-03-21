import { Server } from "socket.io";
import { NextResponse } from "next/server";

let io;

export function GET() {
  if (!io) {
    io = new Server(3001, {
      cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
    });

    io.on("connection", (socket) => {
      console.log("✅ New client connected:", socket.id);

      socket.on("newMessage", (message) => {
        console.log("📩 Message received:", message);

        // ✅ Sabhi clients ko message bhejo (broadcast)
        io.emit("receiveMessage", message);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });
  }

  return NextResponse.json({ message: "Socket Server Running" });
}
