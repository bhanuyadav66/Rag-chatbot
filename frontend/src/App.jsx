// src/App.jsx
import { useState, useCallback } from "react"
import { uploadPDF, streamMessage } from "./api"
import Sidebar    from "./components/Sidebar"
import ChatArea   from "./components/ChatArea"
import "./App.css"

export default function App() {
  const [documents,     setDocuments]     = useState([])
  const [activeDoc,     setActiveDoc]     = useState(null)
  const [chatHistories, setChatHistories] = useState({})
  const [uploading,     setUploading]     = useState(false)
  const [uploadProgress,setUploadProgress]= useState(0)
  const [streaming,     setStreaming]     = useState(false)

  const handleUpload = useCallback(async (file) => {
    setUploading(true)
    setUploadProgress(10)
    const interval = setInterval(() =>
      setUploadProgress(p => Math.min(p + 6, 85)), 900
    )
    try {
      const data = await uploadPDF(file)
      clearInterval(interval)
      setUploadProgress(100)

      const doc = {
        sessionId:   data.session_id,
        filename:    file.name,
        chunks:      data.chunks_indexed,
        pages:       data.pages_loaded,
        suggestions: data.suggested_questions || []
      }

      setDocuments(prev => [...prev, doc])
      setActiveDoc(doc)
      setChatHistories(prev => ({
        ...prev,
        [doc.sessionId]: [{
          id:          Date.now(),
          role:        "assistant",
          text:        `Ready! Indexed **${doc.chunks} chunks** across **${doc.pages} pages** from **${file.name}**.`,
          pages:       [],
          sources:     [],
          suggestions: doc.suggestions,
          streaming:   false
        }]
      }))
      setTimeout(() => { setUploading(false); setUploadProgress(0) }, 500)
    } catch {
      clearInterval(interval)
      setUploading(false)
      setUploadProgress(0)
      alert("Upload failed — make sure the backend is running on port 8000.")
    }
  }, [])

  const handleSend = useCallback(async (question) => {
    if (!activeDoc || streaming) return
    const { sessionId } = activeDoc

    setChatHistories(prev => ({
      ...prev,
      [sessionId]: [
        ...(prev[sessionId] || []),
        { id: Date.now(),     role: "user",      text: question },
        { id: Date.now() + 1, role: "assistant", text: "",
          streaming: true, pages: [], sources: [] }
      ]
    }))
    setStreaming(true)

    await streamMessage(
      sessionId, question,
      (token) => setChatHistories(prev => {
        const msgs = [...(prev[sessionId] || [])]
        const last = { ...msgs[msgs.length - 1] }
        last.text += token
        msgs[msgs.length - 1] = last
        return { ...prev, [sessionId]: msgs }
      }),
      (pages, sources) => {
        setChatHistories(prev => {
          const msgs = [...(prev[sessionId] || [])]
          const last = { ...msgs[msgs.length - 1] }
          last.streaming = false
          last.pages     = pages
          last.sources   = sources
          msgs[msgs.length - 1] = last
          return { ...prev, [sessionId]: msgs }
        })
        setStreaming(false)
      }
    )
  }, [activeDoc, streaming])

  const messages = activeDoc
    ? (chatHistories[activeDoc.sessionId] || [])
    : []

  return (
    <div className="app">
      <Sidebar
        documents={documents}  activeDoc={activeDoc}
        onSelect={setActiveDoc} onUpload={handleUpload}
        uploading={uploading}  uploadProgress={uploadProgress}
      />
      <ChatArea
        doc={activeDoc}  messages={messages}
        onSend={handleSend}  streaming={streaming}
      />
    </div>
  )
}