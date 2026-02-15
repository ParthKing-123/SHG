import { useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X } from "lucide-react";
import { askGemini } from "../utils/gemini";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hi 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await askGemini(input);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong 😕" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      {/* CHAT WINDOW */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            width: 320,
            height: 420,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999999,
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "12px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 600,
            }}
          >
            AI Assistant
            <X
              size={18}
              style={{ cursor: "pointer" }}
              onClick={() => setOpen(false)}
            />
          </div>

          {/* MESSAGES */}
          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              fontSize: 14,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "80%",
                  marginBottom: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    m.sender === "user" ? "#0d9488" : "#f3f4f6",
                  color: m.sender === "user" ? "#ffffff" : "#111827",
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Typing...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div
            style={{
              padding: 8,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              value={input}
              placeholder="Ask something..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                backgroundColor: "#0d9488",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "#0d9488",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
          zIndex: 9999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MessageCircle />
      </button>
    </>,
    document.body
  );
}
