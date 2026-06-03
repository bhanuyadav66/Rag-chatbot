// src/api.js
import axios from "axios"

const BASE = "https://rag-chatbot-frjz.onrender.com"

export const uploadPDF = async (file) => {
  const form = new FormData()
  form.append("file", file)
  const res = await axios.post(`${BASE}/upload`, form)
  return res.data
}

export const streamMessage = async (session_id, question, onToken, onDone) => {
  const res = await fetch(`${BASE}/chat/stream`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ session_id, question })
  })

  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let   buffer  = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop()            // keep incomplete last line

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (data.token !== undefined) onToken(data.token)
        if (data.done)                onDone(data.pages || [], data.sources || [])
      } catch { /* skip malformed lines */ }
    }
  }
}