"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:3000", {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    // Listen for new messages
    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]); // Append new messages at the end
    });

    // Fetch previous messages from API
    axios.get("/api/messages").then((res) => setMessages(res.data));

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message function
  const sendMessage = async () => {
    if (!input.trim() || !username.trim()) return;

    const newMessage = { username, message: input };

    // Emit message via WebSocket
    socketRef.current.emit("newMessage", newMessage);

    // Save message to database
    try {
      await axios.post("/api/messages", newMessage);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Username Input */}
      <input
        className="border p-2 w-full mb-2"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* Messages List */}
      <div className="border p-4 h-80 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <input
        className="border p-2 w-full mt-2"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* Send Button */}
      <button className="bg-blue-500 text-white p-2 w-full mt-2" onClick={sendMessage}>
        Send Message
      </button>
    </div>
  );
}
