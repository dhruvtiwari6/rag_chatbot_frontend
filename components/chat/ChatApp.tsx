'use client'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ChatMessages } from './ChatMessages'
import { MessageInput } from './MessageInput'
import { ChatProvider } from '@/contexts/ChatContext'
import { PDFProvider } from '@/contexts/PDFContext'
import { AppProvider } from '@/contexts/AppContext'
import { TooltipProvider } from '@/components/ui/tooltip'

export function ChatApp() {
  return (
    <TooltipProvider>
      <AppProvider>
        <ChatProvider>
          <PDFProvider>
            <div className="flex h-screen flex-col overflow-hidden bg-background">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="relative flex flex-1 flex-col overflow-hidden">
                  {/* Subtle gradient background */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                  
                  <div className="relative flex flex-1 flex-col overflow-hidden">
                    <ChatMessages />
                    <MessageInput />
                  </div>
                </main>
              </div>
            </div>
          </PDFProvider>
        </ChatProvider>
      </AppProvider>
    </TooltipProvider>
  )
}
