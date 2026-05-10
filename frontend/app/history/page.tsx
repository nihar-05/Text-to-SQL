'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import HistoryList from '@/components/HistoryList'
import { getHistory, type HistoryItem } from '@/lib/api'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const { user } = useUser()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!user) return
    getHistory(user.id)
      .then(setItems)
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = items.filter(i =>
    !filter || i.question.toLowerCase().includes(filter.toLowerCase()) ||
    new Date(i.created_at).toLocaleDateString().includes(filter)
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Query <span style={{ color: 'var(--cyan)' }}>History</span></h1>
          <p className="text-slate-500 text-sm">{items.length} past queries</p>
        </div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by keyword or date..."
          className="neon-input bg-[var(--surface)] border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 w-64"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <HistoryList items={filtered} onSelect={() => {}} />
      )}
    </div>
  )
}