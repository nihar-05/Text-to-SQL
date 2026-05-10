from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import time
import json

load_dotenv()

from app.db import get_schema, run_query
from app.embedder import load_model, embed
from app.cache import check_cache, store_cache, get_redis_client
from app.llm import generate_sql, format_answer_stream
from app.validator import is_safe_sql
from app.guardrails import check_input

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model()

class QueryRequest(BaseModel):
    question: str
    connection_string: str
    user_id: str

@app.post("/query")
async def query(request: QueryRequest):
    question = request.question
    connection_string = request.connection_string
    user_id = request.user_id

    # Step 1 — guardrails
    is_valid, reason = check_input(question)
    if not is_valid:
        return JSONResponse(
            status_code=400,
            content={"error": "Sorry, that doesn't look like a database question. Please try again."}
        )

    # Step 2 — embed
    embedding = embed(question, model)

    # Step 3 — check cache
    cached = check_cache(embedding, question, user_id)
    if cached:
        cached_data = json.loads(cached)
        return {
            "answer": cached_data["answer"],
            "sql": cached_data["sql"],
            "cache_hit": True
        }

    # Step 4 — fetch schema
    try:
        schema = get_schema(connection_string)
    except Exception:
        return JSONResponse(
            status_code=400,
            content={"error": "Sorry, we couldn't connect to your database. Please check your connection string."}
        )

    # Step 5 — generate SQL
    sql = generate_sql(question, schema)

    # Step 6 — check for ambiguous query
    if "AMBIGUOUS_QUERY" in sql:
        return JSONResponse(
            status_code=400,
            content={"error": "Your question is too vague. Please be more specific about what data you're looking for."}
        )

    # Step 7 — validate SQL
    if not is_safe_sql(sql):
        return JSONResponse(
            status_code=400,
            content={"error": "Sorry, we couldn't process your request at this moment."}
        )

    # Step 8 — run query
    try:
        results = run_query(sql, connection_string)
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"error": "Sorry, something went wrong while fetching your data. Please try again."}
        )

    # Step 9 — stream answer
    async def stream():
        full_answer = ""
        async for token in format_answer_stream(question, results):
            full_answer += token
            yield f"data: {json.dumps({'token': token})}\n\n"

        store_cache(question, embedding, json.dumps({"answer": full_answer, "sql": sql}), user_id)

        # Save to history
        r = get_redis_client()
        history_entry = json.dumps({
            "question": question,
            "sql": sql,
            "answer": full_answer,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        })
        r.lpush(f"history:{user_id}", history_entry)
        r.ltrim(f"history:{user_id}", 0, 49)

        yield f"data: {json.dumps({'sql': sql})}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")

@app.get("/history")
async def get_history(user_id: str):
    try:
        r = get_redis_client()
        entries = r.lrange(f"history:{user_id}", 0, 49)
        return [json.loads(e) for e in entries]
    except Exception:
        return []