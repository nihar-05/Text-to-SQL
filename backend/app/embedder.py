import voyageai
import os

client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))

def load_model():
    return client

def embed(text: str, model) -> list[float]:
    result = model.embed([text], model="voyage-3-lite", input_type="query")
    return result.embeddings[0]