'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import QueryInput from '@/components/QueryInput'
import SqlBlock from '@/components/SqlBlock'
import { motion, AnimatePresence } from 'framer-motion'
import { postQuery, loadConnectionString } from '@/lib/api'
import { useChat } from '@/lib/ChatContext'

export default function DashboardPage() {
  const { user } = useUser()
  const { chat, addEntry } = useChat()
  const [connStr, setConnStr] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const currentAnswerRef = useRef('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setConnStr(loadConnectionString())
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, streaming, currentAnswer])

  const handleQuery = async (question: string) => {
    if (!connStr) { toast.error('Please add your database connection in Settings'); return }
    if (!user) { toast.error('Not authenticated'); return }

    setLoading(true)
    setStreaming(true)
    setCurrentAnswer('')
    setCurrentQuestion(question)
    currentAnswerRef.current = ''

    try {
      await postQuery(
        question,
        connStr,
        user.id,
        (token) => {
          currentAnswerRef.current += token
          setCurrentAnswer(prev => prev + token)
        },
        (sql, cacheHit) => {
          const finalAnswer = currentAnswerRef.current
          addEntry({ question, answer: finalAnswer, sql, cacheHit })
          currentAnswerRef.current = ''
          setStreaming(false)
          setLoading(false)
          setCurrentAnswer('')
          setCurrentQuestion('')
        }
      )
    } catch (err: any) {
      toast.error(err.message || 'Query failed')
      setStreaming(false)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Query your <span style={{ color: 'var(--cyan)' }}>database</span>
        </h1>
        <p className="text-slate-500 text-sm">Ask anything in plain English</p>
      </div>

      <div className="space-y-4 mb-6">
        <AnimatePresence>
          {chat.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <p className="text-xs font-mono text-slate-500 mb-3">
                You asked: <span className="text-slate-300">{entry.question}</span>
              </p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono mb-3 ${
                entry.cacheHit
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${entry.cacheHit ? 'bg-green-400' : 'bg-violet-400'}`} />
                {entry.cacheHit ? 'Cache Hit' : 'Live Query'}
              </div>
              <p className="text-slate-200 text-base leading-relaxed mb-3">{entry.answer}</p>
              {entry.sql && <SqlBlock sql={entry.sql} />}
            </motion.div>
          ))}
        </AnimatePresence>

        {streaming && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <p className="text-xs font-mono text-slate-500 mb-3">
              You asked: <span className="text-slate-300">{currentQuestion}</span>
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono mb-3 bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Live Query
            </div>
            <p className="text-slate-200 text-base leading-relaxed">
              {currentAnswer}
              <span className="text-[var(--cyan)] ml-0.5">▋</span>
            </p>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <QueryInput onSubmit={handleQuery} loading={loading} />
    </div>
  )
}