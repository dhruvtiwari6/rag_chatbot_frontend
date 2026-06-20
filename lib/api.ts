import axios, { AxiosError, AxiosProgressEvent } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      let errorMessage = `API Error: ${error.response.status}`
      
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (typeof error.response.data === 'object') {
          // Handle FastAPI-style error responses with "detail" field
          const data = error.response.data as any
          if (data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
          } else if (data.message) {
            errorMessage = typeof data.message === 'string' ? data.message : JSON.stringify(data.message)
          } else {
            errorMessage = JSON.stringify(data)
          }
        }
      }
      
      // Create error with status code for better handling
      const apiError = new Error(errorMessage) as Error & { status?: number; response?: any }
      apiError.status = error.response.status
      apiError.response = error.response.data
      throw apiError
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: No response from server')
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

/**
 * POST /threads
 * Create a new chat thread for a user_id
 * Request body: { user_id: string }
 * Response: { thread_id: string }
 */
export async function createThread(userId: string): Promise<{ thread_id: string }> {
  const { data } = await api.post<{ thread_id: string }>(
    '/threads',
    { user_id: userId }
  )
  console.log("thread_id is : ", data.thread_id);
  return data
}

/**
 * GET /users/{user_id}/threads
 * Get all thread_ids for a specific user_id
 * Response: { user_id: string, threads: string[] }
 */
export async function getUserThreads(userId: string): Promise<{ user_id: string; threads: string[] }> {
  const { data } = await api.get<{ user_id: string; threads: string[] }>(
    `/users/${encodeURIComponent(userId)}/threads`
  )
  return data
}

/**
 * POST /chat
 * Send a message to the chatbot and get a response
 * Request body: { message: string, user_id: string }
 * Response: { response: string, thread_id: string }
 */
export async function sendMessage(
  message: string,
  thread_id: string
): Promise<{ response: string; thread_id: string }> {
  console.log("sending over to chat with id :", thread_id);
  const { data } = await api.post<{ response: string; thread_id: string }>('/chat', {
    message,
    thread_id: thread_id,
  })
  return data
}

/**
 * GET /chat/{thread_id}/history
 * Get chat history for a specific thread
 * Response: { thread_id: string, messages: Array<{ role: string, content: string }> }
 */
export async function getThreadHistory(
  threadId: string
): Promise<{ thread_id: string; messages: Array<{ role: 'user' | 'assistant'; content: string }> }> {
  const { data } = await api.get<{
    thread_id: string
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  }>(`/chat/${encodeURIComponent(threadId)}/history`)
  return data
}

/**
 * POST /upload-pdf
 * Upload a PDF file for a specific thread
 * Request: FormData with 'file' (File) and 'thread_id' (string)
 * Response: { status: string, chunks_added: number, thread_id: string }
 */
export async function uploadPDF(
  file: File,
  threadId: string,
  onProgress?: (progress: number) => void
): Promise<{ status: string; chunks_added: number; thread_id: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('thread_id', threadId)

  const { data } = await api.post<{ status: string; chunks_added: number; thread_id: string }>(
    '/upload-pdf',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }
  )
  return data
}

/**
 * GET /health
 * Health check endpoint
 * Response: { status: string }
 */
export async function healthCheck(): Promise<{ status: string }> {
  const { data } = await api.get<{ status: string }>('/health')
  return data
}
