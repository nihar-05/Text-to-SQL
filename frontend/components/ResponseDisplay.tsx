'use client'
import { motion } from 'framer-motion'
import SqlBlock from './SqlBlock'

interface Props {
  answer: string
  sql: string
  cacheHit: boolean | null
  streaming: boolean
}

export default function ResponseDisplay({ answer, sql, cacheHit, streaming }: Props) {
  if (!answer && !streaming) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 glass rounded-2xl p-6"
    >
      {cacheHit !== null && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono mb-4 ${
          cacheHit
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cacheHit ? 'bg-green-400' : 'bg-violet-400'} ${streaming ? 'animate-pulse' : ''}`} />
          {cacheHit ? 'Cache Hit' : 'Live Query'}
        </div>
      )}
      <div className="text-slate-200 text-base leading-relaxed">
        {answer}
        {streaming && <span className="cursor-blink text-[var(--cyan)] ml-0.5">▋</span>}
      </div>
      {streaming && !answer && (
        <div className="space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      )}
      {sql && <SqlBlock sql={sql} />}
    </motion.div>
  )
}