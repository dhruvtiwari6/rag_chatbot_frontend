'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { PDFContextType, PDFInfo } from '@/types/chat'
import * as api from '@/lib/api'
import { toast } from 'sonner'

const PDFContext = createContext<PDFContextType | undefined>(undefined)

export function PDFProvider({ children }: { children: ReactNode }) {
  const [uploadedPDF, setUploadedPDF] = useState<PDFInfo | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadPDF = useCallback(async (file: File, threadId: string) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const result = await api.uploadPDF(file, threadId, (progress) => {
        setUploadProgress(progress)
      })

      setUploadedPDF({
        name: file.name,
        chunksAdded: result.chunks_added,
        threadId: result.thread_id,
      })
      toast.success(`PDF uploaded successfully! ${result.chunks_added} chunks processed.`)
    } catch (error) {
      console.error('PDF upload error:', error)
      toast.error('Failed to upload PDF. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [])

  const clearPDF = useCallback(() => {
    setUploadedPDF(null)
  }, [])

  return (
    <PDFContext.Provider value={{ uploadedPDF, isUploading, uploadProgress, uploadPDF, clearPDF }}>
      {children}
    </PDFContext.Provider>
  )
}

export function usePDF() {
  const context = useContext(PDFContext)
  if (!context) {
    throw new Error('usePDF must be used within PDFProvider')
  }
  return context
}
