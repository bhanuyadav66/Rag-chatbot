from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from pypdf import PdfReader

CHROMA_PATH = "./chroma_db"

def ingest_pdf(file_path: str, session_id: str) -> dict:

    # Step 1 — Load PDF
    reader = PdfReader(file_path)
    pages = [
        Document(
            page_content=page.extract_text() or "",
            metadata={"source": file_path, "page": page_number}
        )
        for page_number, page in enumerate(reader.pages)
    ]
    print(f"Loaded {len(pages)} pages")

    # Step 2 — Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(pages)
    print(f"Created {len(chunks)} chunks")

    # Step 3 — Embed and store
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH,
        collection_name=session_id
    )
    print(f"Stored in ChromaDB under collection: {session_id}")

    return {
        "session_id": session_id,
        "chunks_indexed": len(chunks),
        "pages_loaded": len(pages),
        "status": "success"
    }
