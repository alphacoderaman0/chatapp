import Message from "@/app/model/message";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb"; 
export async function GET() {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }); // Oldest to newest
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching messages" }, { status: 500 });
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
