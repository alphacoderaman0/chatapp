

"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [socketError, setSocketError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3002", {
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        console.log("✅ WebSocket Connected!");
        setSocketError(null);
      });

      socketRef.current.on("receiveMessage", (msg) => {
        console.log("📩 Received real-time message from WebSocket:", msg);
        setMessages((prev) => [...prev, msg]);
      });

      socketRef.current.on("disconnect", () => {
        console.warn("⚠️ WebSocket Disconnected!");
        setSocketError("WebSocket Disconnected. Trying to reconnect...");
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("❌ WebSocket Error:", err.message);
        setSocketError("Unable to connect to WebSocket.");
      });
    }

    axios.get("/api/messages").then((res) => {
      setMessages(res.data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !username.trim()) return;

    const newMessage = { username, message: input };

    try {
      // Emit message via WebSocket
      socketRef.current.emit("newMessage", newMessage);

      // Save message to database
      await axios.post("/api/messages", newMessage);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <input className="border p-2 w-full mb-2" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      {socketError && <p className="text-red-500">{socketError}</p>}
      <div className="border p-4 h-80 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.username}:</strong> {msg.message}</p>
        ))}
      </div>
      <input className="border p-2 w-full mt-2" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 w-full mt-2" onClick={sendMessage}>Send Message</button>
    </div>
  );
}


