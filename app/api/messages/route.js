import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const messages = await Message.find().sort({ timestamp: -1 });
  return NextResponse.json(messages);
}

export async function POST(req) {
  await connectDB();
  const { username, message } = await req.json();
  const newMessage = await Message.create({ username, message });
  return NextResponse.json(newMessage);
}
