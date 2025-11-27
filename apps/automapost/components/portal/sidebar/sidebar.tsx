'use client'

import { useState, useMemo } from 'react'
import { 
  Grid3X3, 
  Facebook, 
  Instagram, 
  Linkedin, 
  ChevronDown,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useChannel } from '@/contexts/ApplicationContext'

interface Channel {
  id: string
  name: string
  icon: React.ReactNode
  count: number
  color: string
  bgColor: string
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [isConnectNewOpen, setIsConnectNewOpen] = useState(false)
  const { user } = useAuth()
  const { selectedChannel, setSelectedChannel } = useChannel()
  
  // Define all available channels
  const allChannels: Channel[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      count: 3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      count: 5,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: (
        <svg className="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      count: 4,
      color: 'text-slate-800',
      bgColor: 'bg-slate-50'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      count: 2,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    }
  ]
  
  // Filter channels based on connected providers
  const connectedChannels = useMemo(() => {
    if (!user?.connectedProviders) return []
    
    const connectedProviderNames = user.connectedProviders.map(p => p.provider.toLowerCase())
    return allChannels.filter(channel => 
      connectedProviderNames.includes(channel.id.toLowerCase())
    )
  }, [user?.connectedProviders])
  
  // Create the final channels list with "All Channels" if user has any connected
  const channels = useMemo(() => {
    if (connectedChannels.length === 0) return []
    
    const totalCount = connectedChannels.reduce((sum, channel) => sum + channel.count, 0)
    
    return [
      {
        id: 'all',
        name: 'All Channels',
        icon: <Grid3X3 className="w-5 h-5" />,
        count: totalCount,
        color: 'text-[#0078D4]',
        bgColor: 'bg-[#EBF4FF]'
      },
      ...connectedChannels
    ]
  }, [connectedChannels])
  
  // Get channels that are not connected yet
  const availableToConnect = useMemo(() => {
    if (!user?.connectedProviders) return allChannels
    
    const connectedProviderNames = user.connectedProviders.map(p => p.provider.toLowerCase())
    return allChannels.filter(channel => 
      !connectedProviderNames.includes(channel.id.toLowerCase())
    ).map(channel => ({
      id: `${channel.id}-new`,
      name: channel.name,
      icon: channel.icon
    }))
  }, [user?.connectedProviders])

  return (
    <aside 
      className={cn(
        "fixed md:relative inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#DADDE1] overflow-y-auto transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "md:block"
      )}
    >
      {/* Close button for mobile */}
      <div className="flex justify-end p-4 md:hidden">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-[#1C1E21]" />
        </button>
      </div>
      
      <div className="p-4 md:p-6 pt-0 md:pt-6">
        {/* Channel Selector */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-4">
            Channels
          </h2>
          
          {channels.length > 0 ? (
            <>
              {/* Render all channels */}
              <div className="space-y-2">
                {channels.map((channel) => {
                  const isSelected = selectedChannel.id === channel.id
                  
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel({ 
                        id: channel.id, 
                        name: channel.name,
                        provider: channel.id === 'all' ? undefined : channel.id
                      })}
                      className={cn(
                        "w-full rounded-xl transition-all text-left",
                        isSelected 
                          ? "border border-[#0078D4]" 
                          : "hover:bg-[#F0F2F5] hover:translate-x-1.5 hover:scale-[1.02]",
                        "cursor-pointer"
                      )}
                    >
                      <div className={cn(
                        "rounded-xl p-3",
                        isSelected ? "bg-white" : ""
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", channel.bgColor)}>
                              <span className={channel.color}>{channel.icon}</span>
                            </div>
                            <span className={cn(
                              isSelected ? "font-semibold text-[#1C1E21]" : "text-[#1C1E21] font-medium"
                            )}>
                              {channel.name}
                            </span>
                          </div>
                          {/* 
                          This count is nice to have, but we did not implement the backend yet.
                          <span className={cn(
                            "text-sm px-2.5 py-1 rounded-full",
                            isSelected 
                              ? "text-[#0078D4] border border-[#0078D4] bg-[#EBF4FF] font-medium"
                              : "text-gray-600 border border-[#DADDE1] py-0.5 px-2"
                          )}>
                            {channel.count}
                          </span> */}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="p-4 bg-[#F0F2F5] rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-2">No channels connected</p>
              <p className="text-xs text-gray-500">Connect a channel below to get started</p>
            </div>
          )}
        </div>
        
        {/* Connect New Channels */}
        <div className="border-t border-[#DADDE1] pt-6">
          <button
            onClick={() => setIsConnectNewOpen(!isConnectNewOpen)}
            className="w-full flex items-center justify-between text-left mb-4 group hover:opacity-80 transition-opacity rounded-lg p-1 cursor-pointer"
          >
            <h3 className="text-xs font-bold text-[#1C1E21] uppercase tracking-wider">
              Connect New
            </h3>
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-[#1C1E21] transition-transform duration-200",
                isConnectNewOpen && "rotate-180"
              )}
            />
          </button>
          
          <div className={cn(
            "space-y-2 overflow-hidden transition-all duration-200",
            isConnectNewOpen ? "max-h-96" : "max-h-0"
          )}>
            {availableToConnect.length > 0 ? (
              availableToConnect.map((channel) => (
                <button
                  key={channel.id}
                  className="w-full text-left p-3 rounded-xl hover:bg-[#F0F2F5] flex items-center space-x-3 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="w-9 h-9 bg-[#EBF4FF] rounded-xl flex items-center justify-center">
                    <span className="text-[#0078D4]">{channel.icon}</span>
                  </div>
                  <span className="text-[#1C1E21] font-medium">{channel.name}</span>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500">
                All channels connected!
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
