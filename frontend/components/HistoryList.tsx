'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HistoryItem } from '@/lib/api'
import SqlBlock from './SqlBlock'

interface Props {
  items: HistoryItem[]
  onSelect: (q: string) => void
}

export default function HistoryList({ items, onSelect }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (!items.length) return (
    <div className="text-center py-20 text-slate-600 font-mono text-sm">
      No query history yet. Run your first query!
    </div>
  )

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass rounded-xl border border-transparent hover:border-[var(--cyan)] transition-all"
        >
          {/* Header — always visible */}
          <div
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="p-4 cursor-pointer flex items-start justify-between gap-4 group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 font-medium mb-1 group-hover:text-[var(--cyan)] transition-colors truncate">
                {item.question}
              </p>
              <p className="text-xs text-slate-500 font-mono truncate">{item.answer}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-600 font-mono">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
              <span className="text-slate-500 text-xs">{expanded === i ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {expanded === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden px-4 pb-4"
              >
                <p className="text-slate-200 text-sm leading-relaxed mb-3">{item.answer}</p>
                {item.sql && <SqlBlock sql={item.sql} />}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}