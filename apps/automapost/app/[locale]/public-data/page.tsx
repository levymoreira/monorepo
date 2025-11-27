'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface LeadsData {
  date: string
  count: number
  cumulative: number
}

interface ApiResponse {
  data: LeadsData[]
  total: number
}

const chartConfig = {
  count: {
    label: "New Leads",
    color: "hsl(var(--chart-1))",
  },
  cumulative: {
    label: "Total Leads", 
    color: "hsl(var(--chart-2))",
  },
}

export default function PublicDataPage() {
  const [leadsData, setLeadsData] = useState<LeadsData[]>([])
  const [totalLeads, setTotalLeads] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/public-data/leads')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data: ApiResponse = await response.json()
        
        // Format dates for better display
        const formattedData = data.data.map(item => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        }))
        
        setLeadsData(formattedData)
        setTotalLeads(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mb-8"></div>
            <div className="grid gap-6 mb-8">
              <div className="h-64 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Public Data Dashboard</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700">Error loading data: {error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            AutomaPost Public Data
          </h1>
          <p className="text-slate-600">
            Real-time insights into our platform growth and user engagement.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime registrations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leadsData.length > 0 ? leadsData[leadsData.length - 1]?.count || 0 : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Leads today
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsData.length}</div>
              <p className="text-xs text-muted-foreground">
                Days with activity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6">
          {/* Cumulative Leads Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Total Leads Growth</CardTitle>
              <CardDescription>
                Cumulative number of leads over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <AreaChart data={leadsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="var(--color-cumulative)"
                    fill="var(--color-cumulative)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Daily New Leads Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily New Leads</CardTitle>
              <CardDescription>
                Number of new leads registered each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <LineChart data={leadsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-count)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Data updated in real-time • Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
