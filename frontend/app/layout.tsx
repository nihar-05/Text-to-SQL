import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import { ChatProvider } from '@/lib/ChatContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'QueryMind — Text to SQL',
  description: 'Ask your database anything, in plain English.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ChatProvider>
        <html lang="en">
          <body>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#13131f',
                  color: '#e2e8f0',
                  border: '1px solid rgba(0,245,255,0.2)',
                  fontFamily: 'Geist, sans-serif',
                },
              }}
            />
          </body>
        </html>
      </ChatProvider>
    </ClerkProvider>
  )
}