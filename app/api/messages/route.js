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
    console.log("POST /api/messages called"); // Add this log
    await connectDB();

    // Ensure request body is valid
    const body = await req.json().catch(() => null);
    if (!body || !body.username || !body.message) {
      console.error("Missing username or message");
      return NextResponse.json({ error: "Missing username or message" }, { status: 400 });
    }

    console.log("Received Data:", body); // Log request body

    const { username, message } = body;
    const newMessage = await Message.create({ username, message });

    console.log("Message Saved:", newMessage); // Log saved message

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
