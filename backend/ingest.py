from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from sentence_transformers import SentenceTransformer
from typing import List

class LocalEmbeddings(Embeddings):
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.model.encode(texts, convert_to_numpy=True).tolist()

    def embed_query(self, text: str) -> List[float]:
        return self.model.encode(text, convert_to_numpy=True).tolist()

CHROMA_PATH = "./chroma_db"

def get_embeddings():
    return LocalEmbeddings()

def ingest_pdf(file_path: str, session_id: str) -> dict:
    loader = PyPDFLoader(file_path)
    pages  = loader.load()
    print(f"Loaded {len(pages)} pages")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, chunk_overlap=200
    )
    chunks = splitter.split_documents(pages)
    print(f"Created {len(chunks)} chunks")

    Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        persist_directory=CHROMA_PATH,
        collection_name=session_id
    )
    print(f"Stored in ChromaDB: {session_id}")

    return {
        "session_id":     session_id,
        "chunks_indexed": len(chunks),
        "pages_loaded":   len(pages),
        "status":         "success"
    }