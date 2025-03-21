

import connectDB from "@/app/lib/mongodb";
import Message from "@/app/model/message";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ timestamp: -1 });
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log("POST /api/messages called");
    await connectDB();

    const body = await req.json();
    if (!body || !body.username || !body.message) {
      return NextResponse.json({ error: "Missing username or message" }, { status: 400 });
    }

    console.log("Received Data:", body);
    const newMessage = await Message.create(body);

    // Emit message via WebSocket
    if (global.io) {
      global.io.emit("receiveMessage", newMessage);
    }

    console.log("Message Saved:", newMessage);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}


