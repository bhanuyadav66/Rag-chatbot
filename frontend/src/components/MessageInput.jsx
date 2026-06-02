// src/components/MessageInput.jsx
import { useState } from "react"

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("")

  const send = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText("")
    }
  }

  return (
    <div className="input-area">
      <div className="input-row">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey
            && (e.preventDefault(), send())}
          placeholder={disabled
            ? "Generating answer..."
            : "Ask something about your document..."}
          disabled={disabled}
        />
        <button className="send-btn"
          onClick={send} disabled={disabled || !text.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}