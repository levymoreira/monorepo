'use client'

import { useState, useMemo, useEffect } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PortalLayout } from '@/components/portal/layout/portal-layout'
import { Search, Link2, Grid3X3, Filter, MoreHorizontal, List, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentIdea {
  id: string
  name: string
  content: string
  createdAt: string
  status: 'draft' | 'review' | 'scheduled' | 'published'
  initials: string
  avatarColor: string
}

interface Column {
  id: string
  title: string
  count: number
  ideas: ContentIdea[]
  dotColor: string
}

// Draggable Content Idea Card Component
function DraggableContentIdeaCard({ idea }: { idea: ContentIdea }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idea.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } as React.CSSProperties

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ContentIdeaCard idea={idea} />
    </div>
  )
}

// Content Idea Card Component
function ContentIdeaCard({ idea }: { idea: ContentIdea }) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0",
          idea.avatarColor
        )}>
          {idea.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">{idea.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{idea.createdAt}</p>
          
          <div className="mt-2">
            <p className="text-xs text-gray-600 line-clamp-2">{idea.content}</p>
          </div>
          
          <div className="mt-2">
            <StatusBadge status={idea.status} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    'draft': { label: 'Draft', className: 'bg-gray-50 text-gray-600 border-gray-200' },
    'review': { label: 'Review', className: 'bg-blue-50 text-blue-600 border-blue-200' },
    'scheduled': { label: 'Scheduled', className: 'bg-purple-50 text-purple-600 border-purple-200' },
    'published': { label: 'Published', className: 'bg-green-50 text-green-600 border-green-200' }
  }
  
  const statusConfig = statusMap[status] || { label: status, className: 'bg-gray-50 text-gray-600 border-gray-200' }
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
      statusConfig.className
    )}>
      {statusConfig.label}
    </span>
  )
}

// Kanban Column Component
function KanbanColumn({ column, children }: { column: Column; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  
  return (
    <div className={cn(
      "rounded-2xl flex flex-col min-w-[280px] max-w-[320px]",
      isOver ? 'bg-gray-100' : 'bg-gray-50'
    )}>
      <div className="flex items-center justify-between text-xs text-gray-600 p-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", column.dotColor)}></div>
          <span className="font-semibold tracking-wide uppercase">{column.title}</span>
          <span className="text-gray-600 bg-white/60 px-2 py-0.5 rounded-full font-semibold shadow-sm">{column.count}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <button className="p-1 hover:bg-white/70 rounded-md"><Link2 className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-white/70 rounded-md"><Grid3X3 className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-white/70 rounded-md"><Filter className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-white/70 rounded-md"><MoreHorizontal className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div ref={setNodeRef} className="min-h-[480px] p-2 pt-0">
        <div className="space-y-2">
          {children}
        </div>
      </div>
    </div>
  )
}

// View Switcher Component
function ViewSwitcher({ activeView, onViewChange }: { activeView: 'kanban' | 'list'; onViewChange: (view: 'kanban' | 'list') => void }) {
  return (
    <div className="flex items-center bg-[#F0F2F5] rounded-xl p-1">
      <button
        onClick={() => onViewChange('kanban')}
        className={cn(
          "px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-2 text-sm transition-all cursor-pointer",
          activeView === 'kanban'
            ? "bg-white text-[#1C1E21] shadow-sm border border-[#DADDE1]"
            : "text-[#1C1E21] hover:text-[#1C1E21] hover:bg-white hover:shadow-sm hover:border hover:border-[#DADDE1]"
        )}
      >
        <Grid3X3 className="w-4 h-4" />
        <span>Kanban</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          "px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-2 text-sm transition-all cursor-pointer",
          activeView === 'list'
            ? "bg-white text-[#1C1E21] shadow-sm border border-[#DADDE1]"
            : "text-[#1C1E21] hover:text-[#1C1E21] hover:bg-white hover:shadow-sm hover:border hover:border-[#DADDE1]"
        )}
      >
        <List className="w-4 h-4" />
        <span>List</span>
      </button>
    </div>
  )
}

// List Item Component
function ListIdeaItem({ idea }: { idea: ContentIdea }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0",
            idea.avatarColor
          )}>
            {idea.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-base">{idea.name}</h4>
              <StatusBadge status={idea.status} />
            </div>
            <p className="text-sm text-gray-600 mb-2">{idea.content}</p>
            <p className="text-xs text-gray-500">{idea.createdAt}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IdeasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentView, setCurrentView] = useState<'kanban' | 'list'>('kanban')

  // Detect mobile and set default view
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setCurrentView(isMobile ? 'list' : 'kanban')
  }, [])

  const mockIdeas: ContentIdea[] = [
    {
      id: '1',
      name: 'Blog Post Idea',
      content: 'Exploring sustainable technology trends and their impact on modern business operations.',
      createdAt: 'Created Today',
      status: 'draft',
      initials: 'BP',
      avatarColor: 'bg-orange-500'
    },
    {
      id: '2',
      name: 'Video Script',
      content: 'Create an engaging product demo for Q1 showcasing our new automation features.',
      createdAt: 'Created Today',
      status: 'draft',
      initials: 'VS',
      avatarColor: 'bg-teal-500'
    },
    {
      id: '3',
      name: 'LinkedIn Article',
      content: 'Share leadership insights on building high-performing remote teams in 2024.',
      createdAt: 'Added Today',
      status: 'review',
      initials: 'LA',
      avatarColor: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Instagram Campaign',
      content: 'Launch summer collection campaign with lifestyle photography and user-generated content.',
      createdAt: 'Added Today',
      status: 'review',
      initials: 'IC',
      avatarColor: 'bg-indigo-500'
    },
    {
      id: '5',
      name: 'Email Newsletter',
      content: 'Monthly update featuring new features, customer stories, and industry insights.',
      createdAt: 'Added Today',
      status: 'review',
      initials: 'EN',
      avatarColor: 'bg-orange-500'
    },
    {
      id: '6',
      name: 'Case Study',
      content: 'Document client success story showing 40% efficiency improvement with our platform.',
      createdAt: 'Started Today',
      status: 'scheduled',
      initials: 'CS',
      avatarColor: 'bg-pink-500'
    },
    {
      id: '7',
      name: 'Podcast Episode',
      content: 'Tech talks episode 12: The future of AI in content marketing and automation.',
      createdAt: 'Started Today',
      status: 'scheduled',
      initials: 'PE',
      avatarColor: 'bg-green-500'
    },
    {
      id: '8',
      name: 'Webinar Slides',
      content: 'Growth strategies for SaaS companies: scaling content marketing effectively.',
      createdAt: 'Started Today',
      status: 'scheduled',
      initials: 'WS',
      avatarColor: 'bg-red-500'
    },
    {
      id: '9',
      name: 'Twitter Thread',
      content: 'Industry insights thread about emerging trends in digital marketing and social media.',
      createdAt: 'Started Today',
      status: 'scheduled',
      initials: 'TT',
      avatarColor: 'bg-blue-500'
    },
    {
      id: '10',
      name: 'Annual Report',
      content: 'Comprehensive year-end review covering achievements, growth metrics, and 2025 goals.',
      createdAt: 'Completed Today',
      status: 'published',
      initials: 'AR',
      avatarColor: 'bg-yellow-500'
    },
    {
      id: '11',
      name: 'Product Launch',
      content: 'Announce new feature release with benefits overview and customer testimonials.',
      createdAt: 'Completed Today',
      status: 'published',
      initials: 'PL',
      avatarColor: 'bg-cyan-500'
    }
  ]

  // Board state grouped by column ids
  const [columns, setColumns] = useState({
    notes: mockIdeas.filter(idea => idea.status === 'draft').map(idea => idea.id),
    todo: mockIdeas.filter(idea => idea.status === 'review').map(idea => idea.id),
    inprogress: mockIdeas.filter(idea => idea.status === 'scheduled').map(idea => idea.id),
    done: mockIdeas.filter(idea => idea.status === 'published').map(idea => idea.id),
  })

  const idToIdea = useMemo(() => {
    const map = new Map<string, ContentIdea>()
    mockIdeas.forEach(idea => map.set(idea.id, idea))
    return map
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const fromColumnId = Object.keys(columns).find(col => 
      columns[col as keyof typeof columns].includes(active.id as string)
    ) as keyof typeof columns | undefined
    const toColumnId = (over.id as string) in columns ? over.id as keyof typeof columns : fromColumnId
    if (!fromColumnId || !toColumnId) return

    // If dropped on column container, append to end
    if (fromColumnId !== toColumnId) {
      setColumns(prev => {
        const fromItems = prev[fromColumnId].filter(id => id !== active.id)
        const toItems = [...prev[toColumnId], active.id as string]
        return { ...prev, [fromColumnId]: fromItems, [toColumnId]: toItems }
      })
      return
    }
  }

  const columnDefinitions: Column[] = [
    {
      id: 'notes',
      title: 'NOTES',
      count: columns.notes.length,
      dotColor: 'bg-red-500',
      ideas: []
    },
    {
      id: 'todo',
      title: 'TO DO',
      count: columns.todo.length,
      dotColor: 'bg-blue-500',
      ideas: []
    },
    {
      id: 'inprogress',
      title: 'IN PROGRESS',
      count: columns.inprogress.length,
      dotColor: 'bg-purple-500',
      ideas: []
    },
    {
      id: 'done',
      title: 'DONE',
      count: columns.done.length,
      dotColor: 'bg-green-500',
      ideas: []
    }
  ]

  return (
    <PortalLayout>
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Kanban Board */}
        <div className="flex-1 px-6 py-6 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 pt-3 pb-6">
                        {/* Header with View Switcher and Search */}
            <div className="flex items-center justify-between py-3">
              <ViewSwitcher activeView={currentView} onViewChange={setCurrentView} />
              <div className="max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 px-2 py-1 text-xs bg-gray-200 rounded">
                    /
                  </button>
                </div>
              </div>
            </div>
            <div className="h-px bg-gray-100 my-3 -mx-6"></div>
            
            {/* Conditional View Rendering */}
            {currentView === 'kanban' ? (
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {columnDefinitions.map((column) => (
                    <KanbanColumn key={column.id} column={column}>
                      <SortableContext items={columns[column.id as keyof typeof columns]} strategy={verticalListSortingStrategy}>
                        {columns[column.id as keyof typeof columns].map(id => (
                          <DraggableContentIdeaCard key={id} idea={idToIdea.get(id)!} />
                        ))}
                      </SortableContext>
                    </KanbanColumn>
                  ))}
                </div>
              </DndContext>
            ) : (
              <div className="space-y-4">
                {mockIdeas.map((idea) => (
                  <ListIdeaItem key={idea.id} idea={idea} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
