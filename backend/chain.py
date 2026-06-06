import os
from langchain_core.prompts import PromptTemplate
from retriever import get_retriever

PROMPT_TEMPLATE = """You are a helpful assistant answering questions from a document.

Rules:
- Answer ONLY from the context provided
- If not found, say "I couldn't find that in the document"
- Use markdown: **bold** key terms, bullet points for lists

Context:
{context}

Chat History:
{chat_history}

Question: {question}

Answer:"""


def _make_llm():
    if os.getenv("LLM_PROVIDER", "ollama") == "groq":
        from langchain_groq import ChatGroq
return ChatGroq(
    model="llama-3.1-8b-instant",
            temperature=0,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )
    from langchain_ollama import OllamaLLM
    return OllamaLLM(model="llama3.2", temperature=0)


def _text(response) -> str:
    """Groq returns AIMessage with .content; Ollama returns a plain string."""
    return response.content if hasattr(response, "content") else str(response)


class RAGChain:
    def __init__(self, session_id: str):
        self.llm       = _make_llm()
        self.retriever = get_retriever(session_id)
        self.history   = []
        self.prompt    = PromptTemplate(
            input_variables=["context", "chat_history", "question"],
            template=PROMPT_TEMPLATE
        )

    def _build(self, question: str):
        docs    = self.retriever.invoke(question)
        context = "\n\n".join(d.page_content for d in docs)
        history = "\n".join(
            f"Human: {h['human']}\nAssistant: {h['ai']}"
            for h in self.history[-5:]
        )
        filled  = self.prompt.format(
            context=context, chat_history=history, question=question
        )
        pages   = sorted(set(d.metadata.get("page", 0) + 1 for d in docs))
        sources = [
            {"content": d.page_content[:300],
             "page":    d.metadata.get("page", 0) + 1}
            for d in docs
        ]
        return filled, pages, sources

    def ask(self, question: str) -> dict:
        prompt, pages, sources = self._build(question)
        answer = _text(self.llm.invoke(prompt))
        self.history.append({"human": question, "ai": answer})
        return {"answer": answer, "pages": pages, "sources": sources}

    def stream(self, question: str):
        prompt, pages, sources = self._build(question)
        full = ""
        for chunk in self.llm.stream(prompt):
            token = _text(chunk)
            if token:
                full += token
                yield {"token": token}
        self.history.append({"human": question, "ai": full})
        yield {"done": True, "pages": pages, "sources": sources}


def build_chain(session_id: str) -> RAGChain:
    return RAGChain(session_id)
