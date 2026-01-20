'use client'

import React from 'react'
import { useCallback, useState } from 'react'
import { FileText, Upload, X, Check, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { usePDF } from '@/contexts/PDFContext'
import { useChat } from '@/contexts/ChatContext'
import { cn } from '@/lib/utils'

export function PDFUpload() {
  const { uploadedPDF, isUploading, uploadProgress, uploadPDF, clearPDF } = usePDF()
  const { currentThreadId, createThread } = useChat()
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        const file = files[0]
        if (file.type === 'application/pdf') {
          let threadId = currentThreadId
          
          // Create thread if it doesn't exist
          if (!threadId) {
            threadId = await createThread()
            if (!threadId) {
              return
            }
          }
          
          uploadPDF(file, threadId)
        }
      }
    },
    [currentThreadId, createThread, uploadPDF]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        let threadId = currentThreadId
        
        // Create thread if it doesn't exist
        if (!threadId) {
          threadId = await createThread()
          if (!threadId) {
            e.target.value = ''
            return
          }
        }
        
        uploadPDF(files[0], threadId)
      }
      e.target.value = ''
    },
    [currentThreadId, createThread, uploadPDF]
  )

  // Successfully uploaded state
  if (uploadedPDF) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
          <Check className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-emerald-900 dark:text-emerald-100">
              {uploadedPDF.name}
            </p>
            <Badge variant="secondary" className="shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              Ready
            </Badge>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            {uploadedPDF.chunksAdded} chunks processed and indexed
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900"
          onClick={clearPDF}
        >
          <X className="size-4" />
          <span className="sr-only">Remove PDF</span>
        </Button>
      </div>
    )
  }

  // Uploading state
  if (isUploading) {
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <File className="size-5 animate-pulse text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Processing PDF...</p>
              <span className="text-sm font-medium text-primary">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Extracting and indexing document content
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Upload prompt state
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-all duration-200',
        isDragging
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-muted hover:border-primary/50 hover:bg-muted/50'
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="sr-only"
      />
      
      <div className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors',
        isDragging
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
      )}>
        <Upload className="size-5" />
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium">
          {isDragging ? 'Drop your PDF here' : 'Upload a PDF document'}
        </p>
        <p className="text-xs text-muted-foreground">
          Drag and drop or click to browse
        </p>
      </div>
      
      <div className="hidden items-center gap-1 text-muted-foreground sm:flex">
        <FileText className="size-4" />
        <span className="text-xs">PDF</span>
      </div>
    </label>
  )
}
