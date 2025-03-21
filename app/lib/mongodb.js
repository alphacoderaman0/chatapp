import { Server } from "socket.io";
import mongoose from "mongoose";
import express from "express";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("❌ Missing MONGODB_URI in .env file");
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
    
    const db = mongoose.connection;
    db.once("open", () => {
      console.log("👀 Watching messages collection for real-time updates...");
      const changeStream = db.collection("messages").watch();
      changeStream.on("change", async (change) => {
        console.log("🔄 Real-time change detected:", change);
      
        if (change.operationType === "insert") {
          const fullDocument = change.fullDocument;
          if (fullDocument) {
            io.emit("receiveMessage", fullDocument); // Emit message to all clients
            console.log("📡 Emitted real-time message:", fullDocument);
          }
        }
      });
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

server.listen(3001, async () => {
  console.log("🚀 Server running on port 3001");
  await connectDB();
});

export default connectDB;

