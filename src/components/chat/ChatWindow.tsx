'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date
  isOwn: boolean
}

interface ChatWindowProps {
  messages: Message[]
  loading?: boolean
  error?: string | null
}

export default function ChatWindow({ messages, loading, error }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load messages</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {loading && messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading messages...</div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.isOwn ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  message.isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {!message.isOwn && (
                  <div className="text-xs font-medium mb-1 opacity-70">
                    {message.sender}
                  </div>
                )}
                <div className="text-sm">{message.text}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}
