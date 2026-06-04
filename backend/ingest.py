from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

CHROMA_PATH = "./chroma_db"

def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"}
    )

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
        "session_id":    session_id,
        "chunks_indexed": len(chunks),
        "pages_loaded":  len(pages),
        "status":        "success"
    }