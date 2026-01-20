export interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export interface Thread {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  hasPDF?: boolean
}

export interface PDFInfo {
  name: string
  chunksAdded: number
  threadId: string
}

export interface ChatContextType {
  threads: Thread[]
  currentThreadId: string | null
  messages: Message[]
  isLoading: boolean
  isSending: boolean
  error: string | null
  createThread: () => Promise<string | null>
  selectThread: (threadId: string) => Promise<void>
  deleteThread: (threadId: string) => Promise<void>
  sendMessage: (message: string) => Promise<void>
  loadThreads: () => Promise<void>
  clearError: () => void
}

export interface PDFContextType {
  uploadedPDF: PDFInfo | null
  isUploading: boolean
  uploadProgress: number
  uploadPDF: (file: File, threadId: string) => Promise<void>
  clearPDF: () => void
}

export interface AppContextType {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}
