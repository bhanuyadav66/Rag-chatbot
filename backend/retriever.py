from langchain_chroma import Chroma
from ingest import get_embeddings


CHROMA_PATH = "./chroma_db"


def get_retriever(session_id: str, k: int = 4):
    vectorstore = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=get_embeddings(),
        collection_name=session_id
    )
    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k}
    )
