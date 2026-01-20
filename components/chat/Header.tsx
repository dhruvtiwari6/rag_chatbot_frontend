'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { Menu, Sparkles, Settings, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useApp } from '@/contexts/AppContext'
import { useEffect, useState } from 'react'

export function Header() {
  const { user } = useUser()
  const { toggleSidebar } = useApp()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(!isDark)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-lg">
      <TooltipProvider>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-semibold tracking-tight">RAG Assistant</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">AI-powered document chat</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="size-9">
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isDark ? 'Light mode' : 'Dark mode'}</TooltipContent>
          </Tooltip>

          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9" suppressHydrationWarning>
                  <Settings className="size-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuItem>API Keys</DropdownMenuItem>
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="ml-1 flex items-center gap-3 border-l pl-3">
            {user && (
              <span className="hidden text-sm font-medium sm:block">
                {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
              </span>
            )}
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'size-9 ring-2 ring-border',
                },
              }}
            />
          </div>
        </div>
      </TooltipProvider>
    </header>
  )
}
