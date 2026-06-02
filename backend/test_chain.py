# backend/test_chain.py

from chain import build_chain

chain = build_chain(session_id="test-001")

print("TEST 1: Question in document")
result = chain("What are the skills of this person?")
print("Answer:", result["answer"])
print("Sources: pages", result["pages"])

print("\n" + "-"*40 + "\n")

print("TEST 2: Follow-up (tests memory)")
result2 = chain("What projects have they built?")
print("Answer:", result2["answer"])

print("\n" + "-"*40 + "\n")

print("TEST 3: Not in document")
result3 = chain("What is the capital of France?")
print("Answer:", result3["answer"])