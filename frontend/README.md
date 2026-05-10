# QueryMind — Text-to-SQL Frontend

Dark-themed, futuristic Next.js frontend for your Text-to-SQL chatbot.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3RpcnJpbmctb3Bvc3N1bS0zNy5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=<your Clerk secret key from dashboard>
NEXT_PUBLIC_API_URL=http://localhost:8000  # your FastAPI backend URL
```

Get your `CLERK_SECRET_KEY` from: https://dashboard.clerk.com → API Keys

### 3. Run dev server
```bash
npm run dev
```

Open http://localhost:3000

---

## Backend API Contract

### POST /query
**Body:** `{ question: string, connection_string: string, user_id: string }`

**Response (Cache HIT):** JSON
```json
{ "answer": "...", "sql": "SELECT ...", "cache_hit": true }
```

**Response (Cache MISS):** SSE stream
```
data: {"token": "There"}\n\n
data: {"token": " were"}\n\n
...
data: {"sql": "SELECT COUNT(*) FROM users", "cache_hit": false}\n\n
```

### GET /history?user_id=xxx
**Response:**
```json
[{ "id": "...", "question": "...", "sql": "...", "answer": "...", "created_at": "2024-01-01T00:00:00Z" }]
```

---

## Features
- 🌑 Dark glassmorphism UI with neon cyan/violet accents
- ⚡ Streaming typewriter responses with Cache Hit/Miss badge
- 🔐 Clerk authentication protecting all pages
- 📊 Query history with filter
- 🔌 Database connection panel per session
- 📱 Mobile responsive
