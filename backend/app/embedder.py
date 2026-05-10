from sentence_transformers import SentenceTransformer

def load_model():
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    return model

def embed(text: str, model) -> list[float]:
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()