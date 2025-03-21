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
    axios.get("/api/socket").catch((err) => console.error("⚠️ Socket API Error:", err));

    socketRef.current = io("http://localhost:3001", { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to WebSocket Server");
    });

    // ✅ WebSocket se new message receive hone par update karo
    socketRef.current.on("receiveMessage", (msg) => {
      console.log("📩 New Message Received:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]); // State update karo
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    axios.get("/api/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("⚠️ Fetch Messages Error:", err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !username.trim()) return;

    const newMessage = { username, message: input };

    // ✅ Emit WebSocket event
    socketRef.current.emit("newMessage", newMessage);

    // ✅ UI me update karne ke liye state update karo
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // ✅ Database me store karo
    try {
      await axios.post("/api/messages", newMessage);
      setInput("");
    } catch (error) {
      console.error("⚠️ Error saving message:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <input
        className="border p-2 w-full mb-2"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div className="border p-4 h-80 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        className="border p-2 w-full mt-2"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button className="bg-blue-500 text-white p-2 w-full mt-2" onClick={sendMessage}>
        Send Message
      </button>
    </div>
  );
}


