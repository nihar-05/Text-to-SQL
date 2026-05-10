'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatEntry {
  question: string
  answer: string
  sql: string
  cacheHit: boolean
}

interface ChatContextType {
  chat: ChatEntry[]
  addEntry: (entry: ChatEntry) => void
  clearChat: () => void
}

const ChatContext = createContext<ChatContextType>({
  chat: [],
  addEntry: () => {},
  clearChat: () => {},
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chat, setChat] = useState<ChatEntry[]>([])

  const addEntry = (entry: ChatEntry) => {
    setChat(prev => [...prev, entry])
  }

  const clearChat = () => setChat([])

  return (
    <ChatContext.Provider value={{ chat, addEntry, clearChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)