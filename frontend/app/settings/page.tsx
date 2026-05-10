'use client'
import { useState, useEffect } from 'react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { saveConnectionString, loadConnectionString } from '@/lib/api'

export default function SettingsPage() {
  const { user } = useUser()
  const [connStr, setConnStr] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConnStr(loadConnectionString())
  }, [])

  const save = () => {
    if (!connStr.startsWith('postgresql://') && !connStr.startsWith('postgres://')) {
      toast.error('Invalid connection string')
      return
    }
    saveConnectionString(connStr)
    setSaved(true)
    toast.success('Connection string saved!')
  }

  const clear = () => {
    saveConnectionString('')
    setConnStr('')
    setSaved(false)
    toast.success('Connection string cleared.')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">
        <span style={{ color: 'var(--cyan)' }}>Settings</span>
      </h1>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-[var(--cyan)]">🔌</span> Database Connection
        </h2>
        <label className="text-xs text-slate-500 font-mono mb-2 block">POSTGRES CONNECTION STRING</label>
        <input
          value={connStr}
          onChange={e => { setConnStr(e.target.value); setSaved(false) }}
          placeholder="postgresql://user:password@host:5432/dbname"
          className="neon-input w-full bg-[var(--bg)] border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-200 placeholder:text-slate-600 mb-3"
        />
        <div className="flex gap-2">
          <motion.button
            onClick={save}
            whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(0,245,255,0.3)' }}
            className="px-5 py-2 bg-[var(--cyan)] text-black text-sm font-semibold rounded-lg"
          >
            {saved ? '✓ Saved' : 'Save Connection'}
          </motion.button>
          <button onClick={clear} className="px-5 py-2 text-slate-400 text-sm hover:text-white transition">
            Clear
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-[var(--violet)]">👤</span> Account
        </h2>
        <p className="text-sm text-slate-400 mb-1">Signed in as</p>
        <p className="text-sm font-mono text-[var(--cyan)]">{user?.primaryEmailAddress?.emailAddress}</p>
        <p className="text-xs text-slate-600 font-mono mt-1">ID: {user?.id}</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">⚠️</span> Danger Zone
        </h2>
        <SignOutButton redirectUrl="/">
          <button className="px-5 py-2 border border-red-500/40 text-red-400 text-sm rounded-lg hover:bg-red-500/10 transition">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}