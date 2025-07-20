import chromadb
import os

client = chromadb.Client()
collection_cache = {}

async def store_embeddings(stack_id, embeddings, texts):
    collection = client.get_or_create_collection(stack_id)
    collection.add(documents=texts, embeddings=embeddings, ids=[f"chunk-{i}" for i in range(len(texts))])
    collection_cache[stack_id] = collection

def load_vectorstore(stack_id):
    return collection_cache.get(stack_id)