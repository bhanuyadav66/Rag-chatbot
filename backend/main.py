import os, uuid, shutil, json, re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ingest import ingest_pdf
from chain import build_chain, _make_llm, _text
from langchain_community.document_loaders import PyPDFLoader

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
sessions: dict = {}


def generate_suggestions(file_path: str) -> list:
    try:
        loader  = PyPDFLoader(file_path)
        pages   = loader.load()
        preview = " ".join(p.page_content for p in pages[:3])[:2000]
        llm     = _make_llm()
        prompt  = f"""Read this excerpt. Write exactly 3 short questions a reader would ask.
Return ONLY a JSON array. Example: ["Q1?", "Q2?", "Q3?"]

Excerpt: {preview}

JSON:"""
        response = _text(llm.invoke(prompt))
        match    = re.search(r'\[.*?\]', response, re.DOTALL)
        return json.loads(match.group()) if match else []
    except Exception as e:
        print(f"Suggestion error: {e}")
        return []


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files accepted")

    session_id = str(uuid.uuid4())
    save_path  = f"{UPLOAD_DIR}/{session_id}.pdf"

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result      = ingest_pdf(save_path, session_id)
    sessions[session_id] = build_chain(session_id)
    suggestions = generate_suggestions(save_path)

    return {
        "session_id":          session_id,
        "filename":            file.filename,
        "chunks_indexed":      result["chunks_indexed"],
        "pages_loaded":        result["pages_loaded"],
        "suggested_questions": suggestions
    }


class ChatRequest(BaseModel):
    session_id: str
    question:   str


@app.post("/chat")
async def chat(req: ChatRequest):
    chain = sessions.get(req.session_id)
    if not chain:
        raise HTTPException(404, "Session not found. Upload a document first.")
    return chain.ask(req.question)


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    chain = sessions.get(req.session_id)
    if not chain:
        raise HTTPException(404, "Session not found. Upload a document first.")

    def generate():
        for chunk in chain.stream(req.question):
            yield f"data: {json.dumps(chunk)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


@app.get("/health")
async def health():
    return {"status": "ok", "active_sessions": len(sessions)}