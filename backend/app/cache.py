import chromadb
import redis
import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

def get_redis_client():
    return redis.Redis.from_url(os.getenv("REDIS_URL"), decode_responses=True)

def get_chroma_client():
    client = chromadb.Client()
    collection = client.get_or_create_collection(
        name="query_cache",
        metadata={"hnsw:space": "cosine"}
    )
    return collection

def get_pinecone_index():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    return pc.Index("query-cache")

def check_cache(embedding: list[float], question: str, user_id: str, threshold: float = 0.92):
    cache_key = f"{user_id}:{question}"
    vector_store = os.getenv("VECTOR_STORE", "chroma")

    if vector_store == "pinecone":
        index = get_pinecone_index()
        results = index.query(vector=embedding, top_k=1, include_metadata=True)
        if not results["matches"]:
            return None
        similarity = results["matches"][0]["score"]
        if similarity >= threshold:
            matched_key = results["matches"][0]["id"]
            r = get_redis_client()
            return r.get(matched_key)
        return None

    else:
        collection = get_chroma_client()
        results = collection.query(
            query_embeddings=[embedding],
            n_results=1
        )
        if not results["ids"][0]:
            return None
        similarity = 1 - results["distances"][0][0]
        if similarity >= threshold:
            matched_key = results["ids"][0][0]
            r = get_redis_client()
            return r.get(matched_key)
        return None

def store_cache(question: str, embedding: list[float], answer: str, user_id: str) -> None:
    cache_key = f"{user_id}:{question}"
    vector_store = os.getenv("VECTOR_STORE", "chroma")

    if vector_store == "pinecone":
        index = get_pinecone_index()
        index.upsert(vectors=[{
            "id": cache_key,
            "values": embedding
        }])
    else:
        collection = get_chroma_client()
        collection.add(
            ids=[cache_key],
            embeddings=[embedding]
        )

    r = get_redis_client()
    r.set(cache_key, answer)