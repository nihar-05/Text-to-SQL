'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'

const links = [
  { href: '/dashboard', label: 'Query', icon: '⚡' },
  { href: '/history', label: 'History', icon: '🕐' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 md:w-56 flex flex-col glass border-r border-[var(--border)] z-50 py-6 px-3 md:px-4">
      <Link href="/" className="font-mono text-[var(--cyan)] font-bold tracking-widest text-xs md:text-sm mb-8 glow-cyan px-1">
        <span className="hidden md:inline">QUERYMIND</span>
        <span className="md:hidden">QM</span>
      </Link>
      <nav className="flex-1 flex flex-col gap-1">
        {links.map(l => {
          const active = path.startsWith(l.href)
          return (
            <Link key={l.href} href={l.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  active
                    ? 'bg-[rgba(0,245,255,0.1)] text-[var(--cyan)] border border-[rgba(0,245,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{l.icon}</span>
                <span className="hidden md:inline">{l.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
      <div className="px-1">
        <UserButton afterSignOutUrl="/" />
      </div>
    </aside>
  )
}
