

import { Server } from "socket.io";

export async function GET() {
  if (!global.io) {
    console.log("🔌 Initializing WebSocket server...");

    global.io = new Server({
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    global.io.on("connection", (socket) => {
      console.log("⚡ A user connected");

      socket.on("newMessage", (msg) => {
        console.log("📩 New message received:", msg);
        global.io.emit("receiveMessage", msg);
      });

      socket.on("disconnect", () => {
        console.log("❌ A user disconnected");
      });
    });

    global.io.listen(3002); // Attach to port 3002
  } else {
    console.log("✅ WebSocket server already running.");
  }

  return new Response("Socket initialized", { status: 200 });
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body || !body.username || !body.message) {
      return new Response(JSON.stringify({ error: "Missing username or message" }), { status: 400 });
    }

    console.log("Received Message:", body);

    // Emit message to all connected clients
    if (global.io) {
      global.io.emit("receiveMessage", body);
    }

    return new Response(JSON.stringify({ success: true, message: "Message broadcasted" }), { status: 200 });
  } catch (error) {
    console.error("POST Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

