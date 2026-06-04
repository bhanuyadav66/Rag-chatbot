from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

CHROMA_PATH = "./chroma_db"

def get_retriever(session_id: str, k: int = 4):

    # Open the same ChromaDB collection that ingest.py created
    embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)

    vectorstore = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embeddings,
        collection_name=session_id
    )

    # Return a retriever that fetches the top-k most similar chunks
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k}
    )

    return retriever
