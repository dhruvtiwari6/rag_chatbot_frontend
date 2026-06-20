'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import type { ChatContextType, Message, Thread } from '@/types/chat'
import * as api from '@/lib/api'
import { toast } from 'sonner'

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadThreads = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await api.getUserThreads(user.id)
      // Backend returns all thread_ids for the user
      
      // Load thread details (history) for each thread to get titles
      const threadPromises = data.threads.map(async (threadId) => {
        try {
          const historyData = await api.getThreadHistory(threadId)
          // Get title from first user message, or use default
          const firstUserMessage = historyData.messages.find(msg => msg.role === 'user')
          const title = firstUserMessage?.content.slice(0, 30) + (firstUserMessage && firstUserMessage.content.length > 30 ? '...' : '') || 'Chat'
          
          return {
            id: threadId,
            title,
            createdAt: new Date(), // Could be improved with actual timestamps from backend
            updatedAt: new Date(),
          } as Thread
        } catch (err) {
          // If history fails, create thread with default title
          return {
            id: threadId,
            title: 'Chat',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Thread
        }
      })
      
      const loadedThreads = await Promise.all(threadPromises)
      
      // Update threads array, ensuring no duplicates
      setThreads(prev => {
        const existingIds = new Set(prev.map(t => t.id))
        const newThreads = loadedThreads.filter(t => !existingIds.has(t.id))
        const updatedThreads = prev.map(existingThread => {
          const loadedThread = loadedThreads.find(t => t.id === existingThread.id)
          return loadedThread || existingThread
        })
        return [...updatedThreads, ...newThreads]
      })
      
      // Automatically select the first thread ONLY if we don't have one selected
      // Use functional update to prevent overriding user selection
      setCurrentThreadId(prev => {
        if (!prev && loadedThreads.length > 0) {
          const firstThreadId = loadedThreads[0].id
          // Load messages for the first thread asynchronously
          api.getThreadHistory(firstThreadId)
            .then(historyData => {
              const loadedMessages: Message[] = historyData.messages.map((msg, index) => ({
                id: `${firstThreadId}-${index}`,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(),
              }))
              setMessages(loadedMessages)
            })
            .catch(historyErr => {
              console.error('Failed to load thread history:', historyErr)
            })
          return firstThreadId
        }
        return prev // Keep existing selection - don't override user's choice
      })
    } catch (err) {
      // Handle errors gracefully
      const error = err as Error & { status?: number }
      if (error.status === 404) {
        // User doesn't have any threads yet - this is fine, just set empty array
        setThreads([])
        setCurrentThreadId(null)
        setMessages([])
        console.log('No threads found for user - will create one on first message')
      } else {
        const message = err instanceof Error ? err.message : 'Failed to load threads'
        setError(message)
        console.error('Load threads error:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user?.id]) // Removed currentThreadId from dependencies to prevent re-running on thread selection

  // Load threads when user is available (on mount/refresh only)
  useEffect(() => {
    if (user?.id) {
      loadThreads()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]) // Only run when user changes, not when loadThreads changes

  const createThread = useCallback(async () => {
    if (!user?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const { thread_id } = await api.createThread(user.id)
      const newThread: Thread = {
        id: thread_id,
        title: 'New Chat',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      // Add thread, ensuring no duplicates
      setThreads(prev => {
        const exists = prev.some(t => t.id === thread_id)
        if (exists) {
          return prev
        }
        return [newThread, ...prev]
      })
      setCurrentThreadId(thread_id)
      setMessages([])
      toast.success('New chat created')
      return thread_id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create thread'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const selectThread = useCallback(async (threadId: string) => {
    setCurrentThreadId(threadId)
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.getThreadHistory(threadId)
      const loadedMessages: Message[] = data.messages.map((msg, index) => ({
        id: `${threadId}-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
      }))
      setMessages(loadedMessages)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load messages'
      setError(message)
      console.error('Load messages error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteThread = useCallback(async (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId))
    if (currentThreadId === threadId) {
      setCurrentThreadId(null)
      setMessages([])
    }
    toast.success('Chat deleted')
  }, [currentThreadId])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !user?.id) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsSending(true)
    setError(null)

    try {
      const response = await api.sendMessage(content.trim(), currentThreadId!)
      
      // Backend returns thread_id - use it to update state
      const threadId = response.thread_id
      
      // If we don't have a current thread or it changed, update it
      if (!currentThreadId || currentThreadId !== threadId) {
        setCurrentThreadId(threadId)
        
        // Check if thread exists in our list, if not add it (ensuring no duplicates)
        setThreads(prev => {
          const exists = prev.some(t => t.id === threadId)
          if (!exists) {
            // Filter out any existing thread with same ID before adding
            return [{
              id: threadId,
              title: content.trim().slice(0, 30) + (content.length > 30 ? '...' : ''),
              createdAt: new Date(),
              updatedAt: new Date(),
            }, ...prev.filter(t => t.id !== threadId)]
          }
          // Update title if it's still "New Chat" or "Chat"
          return prev.map(thread =>
            thread.id === threadId && (thread.title === 'New Chat' || thread.title === 'Chat')
              ? { ...thread, title: content.trim().slice(0, 30) + (content.length > 30 ? '...' : ''), updatedAt: new Date() }
              : thread
          )
        })
      } else {
        // Update thread title if it's still "New Chat" or "Chat"
        setThreads(prev =>
          prev.map(thread =>
            thread.id === threadId && (thread.title === 'New Chat' || thread.title === 'Chat')
              ? { ...thread, title: content.trim().slice(0, 30) + (content.length > 30 ? '...' : ''), updatedAt: new Date() }
              : thread
          )
        )
      }
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message'
      setError(message)
      toast.error(message)
      // Remove the user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setIsSending(false)
    }
  }, [currentThreadId, user?.id])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        threads,
        currentThreadId,
        messages,
        isLoading,
        isSending,
        error,
        createThread,
        selectThread,
        deleteThread,
        sendMessage,
        loadThreads,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
