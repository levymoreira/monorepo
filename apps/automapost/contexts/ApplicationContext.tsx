'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface SelectedChannel {
  id: string
  name: string
  provider?: string
}

interface ApplicationContextType {
  // Channel selection
  selectedChannel: SelectedChannel
  setSelectedChannel: (channel: SelectedChannel) => void
  
  // Add more application-wide state here as needed
  // For example:
  // sidebarCollapsed: boolean
  // setSidebarCollapsed: (collapsed: boolean) => void
  // theme: 'light' | 'dark'
  // setTheme: (theme: 'light' | 'dark') => void
}

const ApplicationContext = createContext<ApplicationContextType>({
  selectedChannel: { id: 'all', name: 'All Channels' },
  setSelectedChannel: () => {},
})

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [selectedChannel, setSelectedChannel] = useState<SelectedChannel>({
    id: 'all',
    name: 'All Channels'
  })
  
  // Add more state management here as the application grows
  
  const value = {
    selectedChannel,
    setSelectedChannel,
    // Add more values here
  }

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  )
}

// Main hook for accessing application context
export function useApplication() {
  const context = useContext(ApplicationContext)
  if (!context) {
    throw new Error('useApplication must be used within an ApplicationProvider')
  }
  return context
}

// Convenience hook specifically for channel selection
export function useChannel() {
  const { selectedChannel, setSelectedChannel } = useApplication()
  return { selectedChannel, setSelectedChannel }
}