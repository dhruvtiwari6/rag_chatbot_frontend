'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Trash2, X, Search, MoreHorizontal, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useChat } from '@/contexts/ChatContext'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { threads, currentThreadId, isLoading, createThread, selectThread, deleteThread, loadThreads } = useChat()
  const { isSidebarOpen, closeSidebar } = useApp()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  const handleCreateThread = async () => {
    await createThread()
    closeSidebar()
  }

  const handleSelectThread = async (threadId: string) => {
    await selectThread(threadId)
    console.log("thread_id :", currentThreadId);
    closeSidebar()
  }

  const handleDeleteThread = async () => {
    if (threadToDelete) {
      await deleteThread(threadToDelete)
      setThreadToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation()
    setThreadToDelete(threadId)
    setDeleteDialogOpen(true)
  }

  // Filter threads by search query and remove duplicates by ID
  const filteredThreads = threads
    .filter((thread, index, self) => 
      // Remove duplicates - keep first occurrence
      index === self.findIndex(t => t.id === thread.id)
    )
    .filter(thread =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-80 flex-col border-r bg-sidebar transition-transform duration-300 ease-out md:static md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <h2 className="text-sm font-semibold text-sidebar-foreground">Chat History</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={closeSidebar} className="size-8 md:hidden">
                  <X className="size-4" />
                  <span className="sr-only">Close sidebar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleCreateThread}
            disabled={isLoading}
            className="w-full justify-start gap-2 shadow-sm"
          >
            <Plus className="size-4" />
            New Conversation
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-sidebar-accent/50 pl-9 text-sm"
            />
          </div>
        </div>

        {/* Thread List */}
        <ScrollArea className="flex-1 min-h-0 px-2">
          <div className="space-y-1 pb-4">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {searchQuery ? 'No chats found' : 'No conversations yet'}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {searchQuery ? 'Try a different search' : 'Start a new chat to begin'}
                </p>
              </div>
            ) : (
              filteredThreads.map(thread => (
                <div
                  key={thread.id}
                  className={cn(
                    'group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150',
                    currentThreadId === thread.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => handleSelectThread(thread.id)}
                >
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      currentThreadId === thread.id
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <MessageSquare className="size-4" />
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{thread.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {formatDate(thread.updatedAt)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => confirmDelete(e as unknown as React.MouseEvent, thread.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 border-t p-3">
          <p className="text-center text-xs text-muted-foreground">
            {threads.length} conversation{threads.length !== 1 ? 's' : ''}
          </p>
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The conversation and all its messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteThread}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
