from retriever import get_retriever

# Use the same session_id from your ingest test
retriever = get_retriever(session_id="test-001")

# Ask a question about the document you indexed
question = "What is the name of the author?"
results = retriever.invoke(question)

print(f"Question: {question}")
print(f"Found {len(results)} relevant chunks\n")

for i, chunk in enumerate(results):
    print(f"--- Chunk {i+1} (page {chunk.metadata.get('page', '?') + 1}) ---")
    print(chunk.page_content[:200])
    print()