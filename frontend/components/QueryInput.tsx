'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onSubmit: (q: string) => void
  loading: boolean
  defaultValue?: string
}

export default function QueryInput({ onSubmit, loading, defaultValue = '' }: Props) {
  const [value, setValue] = useState(defaultValue)
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    if (value.trim() && !loading) {
      onSubmit(value.trim())
      setValue('')
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  return (
    <div className="relative">
      <motion.div
        animate={{ boxShadow: loading ? '0 0 30px rgba(168,85,247,0.3)' : '0 0 0px transparent' }}
        className="glass rounded-2xl p-1"
      >
        <textarea
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask your database anything... e.g. 'How many users signed up last week?'"
          rows={3}
          className="neon-input w-full bg-transparent px-5 py-4 text-base text-slate-100 placeholder:text-slate-600 resize-none rounded-xl font-sans"
          style={{ border: 'none', outline: 'none' }}
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-xs text-slate-600 font-mono">⏎ Enter to submit · Shift+Enter for newline</span>
          <motion.button
            onClick={submit}
            disabled={loading || !value.trim()}
            whileHover={!loading ? { scale: 1.05, boxShadow: '0 0 20px rgba(0,245,255,0.4)' } : {}}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-lg bg-[var(--cyan)] text-black text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Thinking...
              </>
            ) : 'Run Query →'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}