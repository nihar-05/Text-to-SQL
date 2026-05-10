const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const CONN_KEY = 'text2sql_connection_string'

export function saveConnectionString(conn: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONN_KEY, conn)
}

export function loadConnectionString(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(CONN_KEY) || ''
}

export interface QueryResponse {
  answer: string
  sql: string
  cache_hit: boolean
}

export interface HistoryItem {
  id: string
  question: string
  sql: string
  answer: string
  created_at: string
}

export async function postQuery(
  question: string,
  connection_string: string,
  user_id: string,
  onToken: (token: string) => void,
  onDone: (sql: string, cache_hit: boolean) => void
) {
  const res = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, connection_string, user_id }),
  })

  if (!res.ok) throw new Error(await res.text())

  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const data: QueryResponse = await res.json()
    onToken(data.answer)
    onDone(data.sql, true)
    return
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (!payload) continue
      try {
        const parsed = JSON.parse(payload)
        if (parsed.sql !== undefined) {
          onDone(parsed.sql, false)
          return
        }
        if (parsed.token) onToken(parsed.token)
      } catch {
        onToken(payload)
      }
    }
  }
  onDone('', false)
}

export async function getHistory(user_id: string): Promise<HistoryItem[]> {
  const res = await fetch(`${BASE}/history?user_id=${user_id}`)
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}