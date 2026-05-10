# Text-to-SQL Chatbot

A production-grade natural language interface for any PostgreSQL database. Ask questions in plain English — get accurate answers without writing a single line of SQL.

## Demo

> **Query:** "Which patients have severe conditions?"
>
> **Response:** "The patients with severe conditions are Ananya Reddy, Meera Pillai, Pooja Joshi, Rohan Mehta, Suresh Kumar, and Vikram Singh."
>
> First request: ~1977ms | Cache hit: ~80ms (**96% latency reduction**)

---

## Overview

Text-to-SQL bridges the gap between non-technical users and relational databases. Instead of requiring SQL knowledge, users query their database in natural language. The system dynamically extracts the database schema, generates validated SQL, executes it on a live Postgres instance, and returns a human-readable answer.

Built with semantic caching — similar questions reuse cached results, drastically reducing LLM API costs and response latency.

---

## Architecture

```
User Query (natural language)
    ↓
Embed query → HuggingFace (all-MiniLM-L6-v2)
    ↓
ChromaDB similarity search (cosine, threshold: 0.92)
    ↓
Cache HIT → Redis GET → Return cached response
    ↓
Cache MISS → LangChain + LLaMA 3.3 70B (Groq) → Generate SQL
    ↓
Validate SQL (SELECT only — reject destructive queries)
    ↓
Execute on Neon (serverless Postgres)
    ↓
LLM formats results → Natural language answer
    ↓
Store in ChromaDB (embedding) + Redis (response)
    ↓
LangSmith traces the full pipeline
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| API Framework | FastAPI |
| LLM | LLaMA 3.3 70B via Groq |
| LLM Orchestration | LangChain |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` |
| Vector Store (local) | ChromaDB |
| Vector Store (prod) | Pinecone |
| Cache | Upstash Redis |
| Database | Neon (serverless Postgres) |
| Observability | LangSmith |
| Containerization | Docker |

---

## Project Structure

```
text-to-sql/
├── app/
│   ├── main.py          # FastAPI app — POST /query endpoint
│   ├── embedder.py      # HuggingFace embedding model
│   ├── cache.py         # ChromaDB + Redis semantic cache
│   ├── llm.py           # LangChain SQL generation + answer formatting
│   ├── db.py            # Neon DB connection + dynamic schema extraction
│   └── validator.py     # SQL safety validation (SELECT only)
├── .env                 # Environment variables (never commit)
├── .gitignore
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## Getting Started

### Prerequisites

- Python 3.13+
- Docker Desktop
- Accounts on: [Neon](https://neon.tech), [Groq](https://console.groq.com), [Upstash](https://upstash.com), [Pinecone](https://pinecone.io), [LangSmith](https://smith.langchain.com)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/text-to-sql.git
cd text-to-sql
```

### 2. Create and activate virtual environment

```bash
# Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
# Database
NEON_DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# LLM
GROQ_API_KEY=your_groq_api_key

# Vector Store
PINECONE_API_KEY=your_pinecone_api_key
VECTOR_STORE=chroma   # use 'pinecone' in production

# Cache
REDIS_URL=rediss://your_upstash_redis_url

# Observability
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=text-to-sql
```

### 5. Connect your database

Point `NEON_DATABASE_URL` to any Postgres database. The system automatically extracts the schema at startup — no manual configuration needed.

A sample healthcare database schema is included for testing:

```bash
psql "your_neon_connection_string" -f healthcare_db.sql
```

### 6. Run locally

```bash
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` to access the Swagger UI.

### 7. Run with Docker

```bash
docker build -t text-to-sql .
docker run -p 8000:8000 --env-file .env text-to-sql
```

---

## API Reference

### POST /query

Accepts a natural language question and returns a natural language answer.

**Request:**
```json
{
  "question": "Which doctors have more than 15 years of experience?"
}
```

**Response:**
```json
{
  "answer": "The doctors with more than 15 years of experience are Dr. Ramesh Kapoor, Dr. Suresh Pillai, Dr. Preethi Nair, and Dr. Deepa Iyer.",
  "cache_hit": false,
  "sql": "SELECT name FROM doctors WHERE experience_years > 15",
  "latency_ms": 1369.8
}
```

**Cache hit response:**
```json
{
  "answer": "The doctors with more than 15 years of experience are Dr. Ramesh Kapoor, Dr. Suresh Pillai, Dr. Preethi Nair, and Dr. Deepa Iyer.",
  "cache_hit": true,
  "sql": null,
  "latency_ms": 175.25
}
```

---

## Key Design Decisions

**Why semantic caching over exact-match caching?**
Exact-match caching only hits when queries are character-for-character identical. Semantic caching hits when queries mean the same thing — "show me high value customers" and "which customers spent the most?" both hit the same cache entry.

**Why dynamic schema extraction?**
`db.py` queries `information_schema.columns` at startup to extract table names, column names and data types from any connected Postgres database. The schema is passed to the LLM as context — no hardcoding, works with any database structure.

**Why ChromaDB locally and Pinecone in production?**
ChromaDB runs in-memory locally with zero setup. Pinecone is managed, persistent, and scalable in production. Switching is a single environment variable change (`VECTOR_STORE=pinecone`).

**Why stateless FastAPI service?**
All persistence is externalized to Neon, Upstash, and Pinecone. The FastAPI container holds no state — enabling horizontal scaling by spinning up multiple instances behind a load balancer.

**Why validate SQL before execution?**
LLMs can hallucinate destructive queries. Every generated SQL is parsed with `sqlparse` and rejected if it's not a `SELECT` statement — preventing any write, delete, or schema modification on the connected database.

---

## Use Cases

- **Healthcare** — query patient records, appointments, diagnoses without SQL knowledge
- **E-commerce** — ask about orders, inventory, revenue trends in plain English
- **HR** — query employee data, performance records, payroll without technical expertise
- **Finance** — natural language access to transaction history, reports, analytics
- **Any Postgres database** — connect any schema, works out of the box

---

## Observability

All LLM calls are traced in LangSmith. Each trace includes:
- Full prompt sent to the LLM
- Generated SQL
- Token usage
- Latency per step

Visit [smith.langchain.com](https://smith.langchain.com) to view traces.

---

## Roadmap

- [ ] Multi-database support (user-provided Postgres connection strings)
- [ ] User authentication with Clerk
- [ ] Per-user cache isolation (namespaced Redis keys)
- [ ] Token streaming via FastAPI `StreamingResponse`
- [ ] Query history stored in S3
- [ ] AWS EC2 deployment with Docker
- [ ] Input/output guardrails

---

## License

MIT
