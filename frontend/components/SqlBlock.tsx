'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import toast from 'react-hot-toast'

interface Props { sql: string }

export default function SqlBlock({ sql }: Props) {
  const [open, setOpen] = useState(false)

  const copy = () => { navigator.clipboard.writeText(sql); toast.success('SQL copied!') }

  return (
    <div className="mt-4 glass rounded-xl overflow-hidden border border-slate-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition"
      >
        <span className="flex items-center gap-2">
          <span className="text-[var(--violet)]">{'<SQL />'}</span>
          Generated Query
        </span>
        <span>{open ? '▲ Hide' : '▼ Show'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="relative">
              <button onClick={copy} className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded hover:text-white transition">
                Copy
              </button>
              <SyntaxHighlighter
                language="sql"
                style={vscDarkPlus}
                customStyle={{ margin: 0, background: 'transparent', fontSize: '0.8rem', padding: '1rem' }}
              >
                {sql}
              </SyntaxHighlighter>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
