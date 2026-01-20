'use client'

import React from 'react'
import { Sparkles, MessageSquare, FileText, Zap, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChat } from '@/contexts/ChatContext'

interface EmptyStateProps {
  hasThread: boolean
}

const SUGGESTED_PROMPTS = [
  'Summarize the key points from my document',
  'What are the main conclusions?',
  'Help me understand this section',
  'Create a brief overview',
]

export function EmptyState({ hasThread }: EmptyStateProps) {
  const { sendMessage, createThread, currentThreadId } = useChat()

  const handlePromptClick = async (prompt: string) => {
    let threadId = currentThreadId
    if (!threadId) {
      threadId = await createThread()
    }
    if (threadId) {
      await sendMessage(prompt)
    }
  }

  if (!hasThread) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 shadow-lg ring-1 ring-primary/20">
              <Sparkles className="size-10 text-primary" />
            </div>
            <div className="absolute -right-1 -top-1">
              <Badge variant="secondary" className="shadow-sm">Beta</Badge>
            </div>
          </div>
          
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-balance">
              Welcome to RAG Assistant
            </h2>
            <p className="text-muted-foreground text-balance">
              Your intelligent companion for document analysis and conversation. Upload PDFs and ask anything.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<MessageSquare className="size-5" />}
            title="Smart Chat"
            description="Natural conversations with context awareness"
          />
          <FeatureCard
            icon={<FileText className="size-5" />}
            title="PDF Analysis"
            description="Upload and query your documents"
          />
          <FeatureCard
            icon={<Zap className="size-5" />}
            title="Fast Responses"
            description="Get answers in seconds"
          />
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Try asking:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED_PROMPTS.slice(0, 2).map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs bg-transparent"
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
                <ArrowRight className="size-3" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <MessageSquare className="size-7 text-muted-foreground" />
      </div>
      
      <div className="max-w-sm space-y-2 text-center">
        <h3 className="text-lg font-medium">Start the conversation</h3>
        <p className="text-sm text-muted-foreground text-balance">
          Send a message or upload a PDF to get intelligent responses based on your documents.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <Button
            key={prompt}
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs shadow-sm"
            onClick={() => handlePromptClick(prompt)}
          >
            {prompt}
            <ArrowRight className="size-3" />
          </Button>
        ))}
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-0 bg-muted/50 shadow-sm transition-all hover:bg-muted hover:shadow-md">
      <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
