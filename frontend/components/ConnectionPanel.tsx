'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function ConnectionPanel({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const connected = value.length > 0

  const save = () => {
    if (!draft.startsWith('postgresql://') && !draft.startsWith('postgres://')) {
      toast.error('Invalid connection string. Must start with postgresql://')
      return
    }
    onChange(draft)
    setOpen(false)
    toast.success('Database connected!')
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
        {connected ? 'DB Connected' : 'No DB Connected'}
        <span className="ml-1 opacity-50">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="glass p-4 rounded-xl">
              <label className="block text-xs text-slate-400 font-mono mb-2">POSTGRES CONNECTION STRING</label>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="postgresql://user:password@host:5432/dbname"
                className="neon-input w-full bg-[var(--bg)] border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-200 placeholder:text-slate-600"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={save} className="px-4 py-2 text-xs bg-[var(--cyan)] text-black rounded-lg font-semibold hover:opacity-90 transition">
                  Save & Connect
                </button>
                <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white transition">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
