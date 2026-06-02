// src/components/ChatWindow.jsx
import { useEffect, useRef } from "react"

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null)

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div style={{
      flex: 1, overflowY: "auto", display: "flex",
      flexDirection: "column", gap: "12px",
      padding: "16px 0", maxHeight: "65vh"
    }}>
      {messages.map((msg, i) => (
        <div key={i} style={{
          display: "flex",
          justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
        }}>
          <div style={{
            maxWidth: "75%", padding: "10px 14px",
            borderRadius: msg.role === "user"
              ? "16px 16px 4px 16px"
              : "16px 16px 16px 4px",
            backgroundColor: msg.role === "user" ? "#0070f3" : "#f1f1f1",
            color: msg.role === "user" ? "#fff" : "#222",
            fontSize: "14px", lineHeight: "1.6",
            whiteSpace: "pre-wrap"
          }}>
            {msg.text}
            {msg.pages && msg.pages.length > 0 && (
              <div style={{
                marginTop: "6px", fontSize: "11px",
                opacity: 0.7
              }}>
                Source: page {msg.pages.join(", ")}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div style={{
            padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
            backgroundColor: "#f1f1f1", fontSize: "14px", color: "#888"
          }}>
            Thinking...
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}