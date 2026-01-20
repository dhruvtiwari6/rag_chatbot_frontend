'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { EmptyState } from './EmptyState'
import { useChat } from '@/contexts/ChatContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles } from 'lucide-react'

export function ChatMessages() {
  const { messages, currentThreadId, isLoading, isSending } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  if (isLoading && currentThreadId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="size-6 animate-pulse text-primary" />
        </div>
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-3 w-48" />
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return <EmptyState hasThread={!!currentThreadId} />
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="mx-auto max-w-3xl py-6 px-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isSending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
