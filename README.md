# RAG Document Chatbot

Chat with any PDF using AI. Upload a document, ask questions, and get
grounded answers with page citations — powered by Retrieval-Augmented
Generation (RAG).

**Live demo:** [RAG CHATBOT](https://frontend-nine-gamma-15.vercel.app/)

---

## Features

- Upload any PDF and start chatting instantly
- Streaming responses — answers appear word by word
- Page citations on every answer
- Source chunk viewer — see the exact paragraphs the AI read
- Suggested questions auto-generated from your document
- Multi-document support — switch between PDFs in the sidebar
- Copy answers to clipboard

---

## Architecture

PDF Upload → PyPDF (parse) → RecursiveCharacterTextSplitter (chunk)
→ Ollama nomic-embed-text (embed) → ChromaDB (store)
User Question → embed → ChromaDB (similarity search) → top 4 chunks
→ LLM prompt (chunks + question) → streamed answer

**Backend:** FastAPI · LangChain · ChromaDB · Ollama (local) / Groq (cloud)  
**Frontend:** React · Vite · react-markdown

---

## Run locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) installed and running

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Pull the required Ollama models
ollama pull nomic-embed-text
ollama pull llama3.2

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Deploy to production

Set these environment variables on your hosting platform:

| Variable | Value |
|---|---|
| `LLM_PROVIDER` | `groq` |
| `GROQ_API_KEY` | your key from console.groq.com |

Get a free Groq API key at [console.groq.com](https://console.groq.com)

---

## Project structure

rag-chatbot/
├── backend/
│   ├── ingest.py       # PDF → chunks → vectors → ChromaDB
│   ├── retriever.py    # question → vector search → top chunks
│   ├── chain.py        # RAGChain with streaming + memory
│   ├── main.py         # FastAPI routes
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api.js
│       ├── App.jsx
│       └── components/
│           ├── Sidebar.jsx
│           ├── ChatArea.jsx
│           └── MessageInput.jsx
└── README.md

---
