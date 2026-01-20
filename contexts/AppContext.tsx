'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AppContextType } from '@/types/chat'

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <AppContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
