// src/components/UploadZone.jsx

export default function UploadZone({ onUpload, loading }) {

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "application/pdf") {
      onUpload(file)
    } else {
      alert("Please select a PDF file")
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "60vh", gap: "16px"
    }}>
      <h1 style={{ fontSize: "22px", fontWeight: "500" }}>
        Chat with your document
      </h1>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Upload a PDF and ask it anything
      </p>

      <label style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "12px", padding: "40px 60px", border: "1.5px dashed #ccc",
        borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer",
        backgroundColor: "#fafafa"
      }}>
        <span style={{ fontSize: "32px" }}>📄</span>
        <span style={{ fontSize: "14px", color: "#444" }}>
          {loading ? "Processing your PDF..." : "Click to choose a PDF"}
        </span>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={loading}
          style={{ display: "none" }}
        />
      </label>

      {loading && (
        <p style={{ fontSize: "13px", color: "#888" }}>
          Embedding your document — this takes 10–20 seconds...
        </p>
      )}
    </div>
  )
}