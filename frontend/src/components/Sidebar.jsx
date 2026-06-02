// src/components/Sidebar.jsx
import { useRef } from "react"

export default function Sidebar({
  documents, activeDoc, onSelect, onUpload, uploading, uploadProgress
}) {
  const fileRef = useRef()

  const pick = (e) => {
    const f = e.target.files[0]
    if (f) onUpload(f)
    e.target.value = ""
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-mark">D</div>
          <span className="logo-text">DocChat</span>
        </div>

        <button className="upload-btn"
          onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "⏳ Processing..." : "+ Upload PDF"}
        </button>
        <input ref={fileRef} type="file" accept=".pdf"
          onChange={pick} style={{ display: "none" }} />

        {uploading && (
          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill"
                style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="progress-label">
              Embedding... {uploadProgress}%
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-docs">
        {documents.length === 0
          ? <div className="no-docs">
              Upload a PDF to<br />start chatting
            </div>
          : <>
              <div className="docs-section-label">Documents</div>
              {documents.map(doc => (
                <div
                  key={doc.sessionId}
                  className={`doc-item ${activeDoc?.sessionId === doc.sessionId ? "active" : ""}`}
                  onClick={() => onSelect(doc)}
                >
                  <div className="doc-file-icon">📄</div>
                  <div>
                    <div className="doc-name">{doc.filename}</div>
                    <div className="doc-meta">
                      {doc.pages} pages · {doc.chunks} chunks
                    </div>
                  </div>
                </div>
              ))}
            </>
        }
      </div>
    </div>
  )
}