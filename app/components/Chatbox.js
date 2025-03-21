"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

let socket;

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket = io({ path: "/api/socket" });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [msg, ...prev]);
    });

    axios.get("/api/messages").then((res) => setMessages(res.data));

    return () => socket.disconnect();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !username.trim()) return;

    const newMessage = { username, message: input };
    socket.emit("newMessage", newMessage);
    await axios.post("/api/messages", newMessage);
    setInput("");
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
      </div>
      <input
        className="border p-2 w-full mt-2"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2 w-full mt-2" onClick={sendMessage}>
        Send Request
      </button>
    </div>
  );
}
