// src/components/ChatArea.jsx
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import MessageInput from "./MessageInput"

function Message({ msg, onSuggestion }) {
  const [copied,      setCopied]      = useState(false)
  const [showSources, setShowSources] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(msg.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (msg.role === "user") {
    return (
      <div className="message-row user">
        <div className="avatar">U</div>
        <div className="message-body">
          <div className="bubble">{msg.text}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="message-row assistant">
      <div className="avatar">AI</div>
      <div className="message-body">

        <div className="bubble">
          {msg.streaming && !msg.text
            ? <div className="typing-dots">
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            : <ReactMarkdown>{msg.text}</ReactMarkdown>
          }
        </div>

        {/* Suggested questions shown on welcome message */}
        {msg.suggestions?.length > 0 && (
          <div className="suggestions">
            {msg.suggestions.map((s, i) => (
              <button key={i} className="suggestion-chip"
                onClick={() => onSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar: page citations, copy, sources */}
        {!msg.streaming && msg.text && (
          <div className="msg-toolbar">
            {msg.pages?.length > 0 &&
              <span className="page-tag">
                page {msg.pages.join(", ")}
              </span>
            }
            <button className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={copy}>
              {copied ? "Copied!" : "Copy"}
            </button>
            {msg.sources?.length > 0 &&
              <button className="sources-toggle"
                onClick={() => setShowSources(s => !s)}>
                {showSources ? "Hide sources" : "View sources"}
              </button>
            }
          </div>
        )}

        {/* Expandable source chunks */}
        {showSources && (
          <div className="sources-panel">
            {msg.sources.map((src, i) => (
              <div key={i} className="source-chunk">
                <div className="source-page-label">Page {src.page}</div>
                {src.content}…
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}


export default function ChatArea({ doc, messages, onSend, streaming }) {
  const bottomRef = useRef()
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!doc) {
    return (
      <div className="chat-area">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <div className="empty-title">No document selected</div>
          <div className="empty-sub">Upload a PDF from the sidebar</div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-doc-icon">📄</div>
        <div>
          <div className="chat-header-title">{doc.filename}</div>
          <div className="chat-header-sub">
            {doc.pages} pages · {doc.chunks} chunks indexed
          </div>
        </div>
        <div className="chat-header-pill">{doc.chunks} chunks</div>
      </div>

      <div className="messages-wrap">
        {messages.map(msg => (
          <Message key={msg.id} msg={msg} onSuggestion={onSend} />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={onSend} disabled={streaming} />
    </div>
  )
}