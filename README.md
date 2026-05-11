# QueryMind — Natural Language Interface for PostgreSQL

A production-grade Text-to-SQL chatbot. Ask questions in plain English, get accurate answers from any PostgreSQL database — no SQL knowledge required.

**Live Demo:** [querymind-io.netlify.app](https://querymind-io.netlify.app)

---

## Demo

> **Query:** "What are the top 5 product categories by total revenue?"
>
> **Response:** "The top 5 product categories by total revenue are: 1. beleza_saude with $1,258,681.34, 2. relogios_presentes with $1,205,005.68, 3. cama_mesa_banho with $1,036,988.68, 4. esporte_lazer with $988,048.97, and 5. informatica_acessorios with $911,954.32."
>
> First request: ~2100ms | Cache hit: ~85ms (**96% latency reduction**)

---

## Overview

QueryMind bridges the gap between non-technical users and relational databases. Users bring their own Postgres connection string — the system dynamically extracts the schema, runs input guardrails, generates validated SQL via an LLM, executes it on the live database, and streams a natural language answer back token by token.

Semantic caching ensures repeated or similar questions skip the LLM entirely, reducing both latency and API costs.

---

## Architecture

```
User Query (natural language)
    ↓
Guardrails — regex injection detection + LLM relevance classifier
    ↓
Embed query → Voyage AI (voyage-3-lite, 512 dims)
    ↓
Pinecone similarity search (cosine, threshold: 0.92)
    ↓
Cache HIT → Redis GET → Return cached response instantly
    ↓
Cache MISS → Extract DB schema dynamically from user's Postgres
    ↓
LangChain + LLaMA 3.3 70B (Groq) → Generate SQL
    ↓
Check for AMBIGUOUS_QUERY sentinel → reject vague questions
    ↓
Validate SQL (SELECT only — reject all destructive queries)
    ↓
Execute on user's Neon (serverless Postgres)
    ↓
Stream answer token by token via LangChain .astream()
    ↓
Store embedding in Pinecone + response in Upstash Redis
    ↓
Save to Redis history (lpush, ltrim to 50 entries per user)
    ↓
LangSmith traces the full pipeline
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Auth | Clerk |
| API Framework | FastAPI |
| LLM | LLaMA 3.3 70B via Groq |
| LLM Orchestration | LangChain |
| Embeddings | Voyage AI (`voyage-3-lite`) |
| Vector Store | Pinecone |
| Cache + History | Upstash Redis |
| Database | Neon (serverless Postgres) |
| Guardrails | Regex + LLM classifier |
| Observability | LangSmith |
| Containerization | Docker |
| Backend Hosting | Render |
| Frontend Hosting | Netlify |

---

## Project Structure

```
querymind/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI — POST /query, GET /history
│   │   ├── embedder.py      # Voyage AI embedding
│   │   ├── cache.py         # Pinecone + Redis semantic cache
│   │   ├── llm.py           # SQL generation + async streaming answer
│   │   ├── db.py            # Dynamic schema extraction + query execution
│   │   ├── validator.py     # SQL safety validation (SELECT only)
│   │   └── guardrails.py    # Input validation (regex + LLM classifier)
│   ├── healthcare_db.sql    # Sample dataset for testing
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── page.tsx                  # Landing page
    │   ├── layout.tsx                # Root layout (ClerkProvider + ChatProvider)
    │   ├── dashboard/page.tsx        # Chat-style query interface
    │   ├── history/page.tsx          # Query history
    │   └── settings/page.tsx         # Connection string + account
    ├── components/
    │   ├── QueryInput.tsx
    │   ├── SqlBlock.tsx
    │   ├── HistoryList.tsx
    │   └── Sidebar.tsx
    └── lib/
        ├── api.ts                    # postQuery (streaming), getHistory
        └── ChatContext.tsx           # React context for chat state
```

---

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- Docker Desktop
- Accounts on: [Neon](https://neon.tech), [Groq](https://console.groq.com), [Upstash](https://upstash.com), [Pinecone](https://pinecone.io), [Voyage AI](https://voyageai.com), [LangSmith](https://smith.langchain.com), [Clerk](https://clerk.com)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
VECTOR_STORE=pinecone
REDIS_URL=rediss://your_upstash_redis_url
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=text-to-sql
VOYAGE_API_KEY=your_voyage_api_key
```

Run locally:

```bash
uvicorn app.main:app --reload
# or with Docker
docker-compose up --build
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run locally:

```bash
npm run dev
```

---

## API Reference

### POST /query

**Request:**
```json
{
  "question": "Which sellers have more than 500 orders?",
  "connection_string": "postgresql://user:pass@host/db?sslmode=require",
  "user_id": "user_abc123"
}
```

**Response (streaming):**
```
data: {"token": "There"}
data: {"token": " are"}
data: {"token": " 3 sellers..."}
data: {"sql": "SELECT seller_id FROM olist_order_items GROUP BY seller_id HAVING COUNT(*) > 500"}
```

**Cache hit response (JSON):**
```json
{
  "answer": "There are 3 sellers with more than 500 orders.",
  "sql": "SELECT ...",
  "cache_hit": true
}
```

### GET /history?user_id=

Returns last 50 queries for the user from Redis.

---

## Key Design Decisions

**Why connection string per request?**
Multi-tenant by design — every user brings their own Postgres database. No hardcoded DB in the backend, no shared state between users.

**Why semantic caching over exact-match?**
"Show me top customers" and "which customers spent the most?" both hit the same cache entry. Exact-match caching would miss this entirely.

**Why Voyage AI for embeddings?**
HuggingFace `sentence-transformers` loads a full model into memory (~400MB+), which exceeds the free tier on Render. Voyage AI is an API-based embedder with no memory overhead and better performance.

**Why validate SQL before execution?**
LLMs can hallucinate destructive queries. Every generated SQL is parsed with `sqlparse` and rejected if it's not a `SELECT` — preventing any write, delete, or schema modification.

**Why stateless FastAPI?**
All persistence lives in Neon, Upstash, and Pinecone. The container holds no state, making horizontal scaling trivial.

**Why `user_id` namespacing?**
Cache keys are `user_id:question` and history keys are `history:user_id` — completely isolating each user's cache and history from others.

---

## Tested Datasets

- **Healthcare** — patients, doctors, appointments, diagnoses, medications, billing
- **Olist E-commerce** — 9 tables, 100K+ orders, Brazilian e-commerce dataset

---

## Observability

All LLM calls are traced in LangSmith — full prompt, generated SQL, token usage, and per-step latency.

---

## License

MIT
