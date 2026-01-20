'use client'

import { Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function TypingIndicator() {
  return (
    <div className="flex gap-4 px-4 py-4">
      <Avatar className="size-9 shrink-0 ring-2 ring-muted">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          <Sparkles className="size-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">AI Assistant</span>
        <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <span className="size-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: '0ms' }} />
            <span className="size-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: '150ms' }} />
            <span className="size-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  )
}
