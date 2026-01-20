'use client'

import React from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { Send, Loader2, Paperclip, Mic, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { PDFUpload } from './PDFUpload'
import { useChat } from '@/contexts/ChatContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function MessageInput() {
  const { currentThreadId, isSending, sendMessage, createThread } = useChat()
  const [input, setInput] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending) return

    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }, [input, isSending, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="border-t bg-background/80 p-4 backdrop-blur-lg">
      <TooltipProvider>
        <div className="mx-auto max-w-3xl space-y-3">
          {/* PDF Upload Section */}
          {showUpload && (
            <div className="transition-all duration-200">
              <PDFUpload />
            </div>
          )}

          {/* Input Area */}
          <div className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
            {/* Attachment Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0"
                  onClick={() => setShowUpload(!showUpload)}
                  disabled={!currentThreadId && !input.trim()}
                >
                  <Paperclip className={cn('size-4', showUpload && 'text-primary')} />
                  <span className="sr-only">Attach file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach PDF</TooltipContent>
            </Tooltip>

            {/* Text Input */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentThreadId ? 'Message RAG Assistant...' : 'Start a new conversation...'}
              disabled={isSending}
              rows={1}
              className="min-h-[40px] max-h-[200px] flex-1 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
            />

            {/* Send Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  size="icon"
                  className={cn(
                    'size-9 shrink-0 rounded-xl transition-all',
                    input.trim() && !isSending && 'shadow-md'
                  )}
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>

          {/* Helper Text */}
          <div className="flex items-center justify-center gap-4">
            <p className="text-center text-xs text-muted-foreground">
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">Enter</kbd>
              {' '}to send,{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">Shift + Enter</kbd>
              {' '}for new line
            </p>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}
