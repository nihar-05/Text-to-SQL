'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let animId: number
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,245,255,${p.opacity})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,245,255,${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden flex flex-col">
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <span className="font-mono text-[var(--cyan)] font-bold tracking-widest text-lg glow-cyan">QUERYMIND</span>
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link href="/dashboard" className="text-sm text-slate-300 hover:text-[var(--cyan)] transition-colors">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
          </SignedOut>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-block px-3 py-1 mb-6 rounded-full border border-[var(--cyan)] text-[var(--cyan)] text-xs font-mono tracking-widest">
            SEMANTIC SQL · POWERED BY AI
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ask your database<br />
            <span className="glow-cyan" style={{ color: 'var(--cyan)' }}>anything.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-10">
            Type a question in plain English. Get instant SQL-powered answers from your PostgreSQL database — with semantic caching for blazing speed.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <SignedOut>
              <Link href="/sign-up">
                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,245,255,0.4)' }} whileTap={{ scale: 0.97 }} className="px-8 py-3.5 rounded-xl font-semibold text-black bg-[var(--cyan)] transition-all">
                  Get Started →
                </motion.button>
              </Link>
              <Link href="/sign-in">
                <motion.button whileHover={{ scale: 1.03 }} className="px-8 py-3.5 rounded-xl font-semibold text-[var(--cyan)] border border-[var(--cyan)] glass transition-all">
                  Sign In
                </motion.button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,245,255,0.4)' }} className="px-8 py-3.5 rounded-xl font-semibold text-black bg-[var(--cyan)]">
                  Go to Dashboard →
                </motion.button>
              </Link>
            </SignedIn>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="flex gap-3 mt-16 flex-wrap justify-center">
          {['Semantic Caching', 'Streaming Responses', 'Query History', 'Any Postgres DB'].map(f => (
            <span key={f} className="glass px-4 py-2 text-xs text-slate-400 rounded-full border border-slate-700">{f}</span>
          ))}
        </motion.div>
      </main>
    </div>
  )
}