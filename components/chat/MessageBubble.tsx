'use client'

import { User, Sparkles, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          'group flex gap-4 px-4 py-4 transition-colors hover:bg-muted/30',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <Avatar className={cn(
          'size-9 shrink-0 ring-2',
          isUser ? 'ring-primary/20' : 'ring-muted'
        )}>
          <AvatarFallback className={cn(
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}>
            {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
          </AvatarFallback>
        </Avatar>

        <div className={cn('flex max-w-[75%] flex-col gap-1', isUser && 'items-end')}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            {message.timestamp && (
              <span className="text-xs text-muted-foreground/70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div
            className={cn(
              'relative rounded-2xl px-4 py-3 shadow-sm',
              isUser
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-card text-card-foreground border rounded-tl-sm'
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            ) : (
              <div className="markdown-content text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="my-2 last:my-0">{children}</p>,
                    h1: ({ children }) => <h1 className="text-lg font-semibold mt-4 mb-2 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                    code: ({ className, children, ...props }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-muted p-3 rounded text-xs font-mono overflow-x-auto my-2" {...props}>
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto my-2">{children}</pre>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-2 text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-border">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
                    th: ({ children }) => <th className="border border-border px-4 py-2 text-left font-semibold">{children}</th>,
                    td: ({ children }) => <td className="border border-border px-4 py-2">{children}</td>,
                    hr: () => <hr className="my-4 border-border" />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn(
            'flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100',
            isUser && 'flex-row-reverse'
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  <span className="sr-only">Copy message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? 'Copied!' : 'Copy message'}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
