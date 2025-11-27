'use client'

import { useState } from 'react'
import { PortalLayout } from '@/components/portal/layout/portal-layout'
import { Tabs, Tab } from '@/components/portal/tabs/tabs'
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageSquare, Share2, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  
  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'posts', label: 'Posts' },
    { id: 'audience', label: 'Audience' },
    { id: 'competitors', label: 'Competitors' }
  ]

  const timeRanges = [
    { id: '24h', label: '24 hours' },
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' }
  ]

  const stats = [
    {
      label: 'Total Reach',
      value: '45.2K',
      change: '+12.5%',
      icon: <Eye className="w-5 h-5" />,
      positive: true
    },
    {
      label: 'Engagement Rate',
      value: '4.8%',
      change: '+0.3%',
      icon: <Heart className="w-5 h-5" />,
      positive: true
    },
    {
      label: 'Total Posts',
      value: '156',
      change: '+23',
      icon: <MessageSquare className="w-5 h-5" />,
      positive: true
    },
    {
      label: 'Followers',
      value: '12.4K',
      change: '-2.1%',
      icon: <Users className="w-5 h-5" />,
      positive: false
    }
  ]

  return (
    <PortalLayout>
      <div className="max-w-full mx-auto p-4 md:p-6">
        {/* Content Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h2 className="text-xl md:text-2xl font-bold text-[#1C1E21]">Analytics</h2>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 bg-[#F0F2F5] rounded-xl p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setSelectedTimeRange(range.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedTimeRange === range.id 
                      ? "bg-white text-[#1C1E21] shadow-sm" 
                      : "text-[#6B7280] hover:text-[#1C1E21]"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Analytics Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white border border-[#DADDE1] rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        "bg-[#EBF4FF]"
                      )}>
                        <span className="text-[#0078D4]">{stat.icon}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        stat.positive ? "text-green-600" : "text-red-600"
                      )}>
                        {stat.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#1C1E21]">{stat.value}</p>
                      <p className="text-sm text-[#6B7280] mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Engagement Chart Placeholder */}
              <div className="bg-white border border-[#DADDE1] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1C1E21]">Engagement Over Time</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#0078D4] rounded-full"></div>
                      <span className="text-[#6B7280]">Likes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-[#6B7280]">Comments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-[#6B7280]">Shares</span>
                    </div>
                  </div>
                </div>
                
                {/* Chart Placeholder */}
                <div className="h-64 bg-[#F8FAFC] rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-[#6B7280] mx-auto mb-2" />
                    <p className="text-[#6B7280]">Chart visualization will go here</p>
                  </div>
                </div>
              </div>

              {/* Top Performing Posts */}
              <div className="bg-white border border-[#DADDE1] rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#1C1E21] mb-4">Top Performing Posts</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                      <div className="w-16 h-16 bg-[#F0F2F5] rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1C1E21] line-clamp-2 mb-2">
                          Sample post content that performed well with your audience...
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-[#6B7280]">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>1.2K</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>89</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Share2 className="w-3 h-3" />
                            <span>45</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="bg-white border border-[#DADDE1] rounded-xl p-8 text-center">
              <TrendingUp className="w-16 h-16 text-[#0078D4] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#1C1E21] mb-2">Posts Analytics</h3>
              <p className="text-[#6B7280]">Detailed post performance metrics coming soon.</p>
            </div>
          )}

          {activeTab === 'audience' && (
            <div className="bg-white border border-[#DADDE1] rounded-xl p-8 text-center">
              <Users className="w-16 h-16 text-[#0078D4] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#1C1E21] mb-2">Audience Insights</h3>
              <p className="text-[#6B7280]">Demographics and audience behavior analysis coming soon.</p>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="bg-white border border-[#DADDE1] rounded-xl p-8 text-center">
              <Repeat className="w-16 h-16 text-[#0078D4] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#1C1E21] mb-2">Competitor Analysis</h3>
              <p className="text-[#6B7280]">Compare your performance with competitors coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}
